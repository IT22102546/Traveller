import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, FileInput, Badge, Toast } from 'flowbite-react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useSelector } from 'react-redux';

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [order, setOrder] = useState(null);
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (res.ok) {
          setOrder({
            ...data,
            members: Array.isArray(data.members) ? data.members : []
          });
        } else {
          setError(data.message || 'Failed to fetch order');
        }
      } catch (error) {
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadPaymentSlip = async () => {
    if (!file) {
      setImageUploadError('Please select a payment slip');
      return;
    }
    setImageUploadError(null);
  
    try {
      const formData = new FormData();
      formData.append('userId', currentUser._id); 
      formData.append('paymentSlip', file); 
  
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PUT',
        body: formData,
      });
  
      if (res.ok) {
        setShowSuccessToast(true);
        setTimeout(() => {
          navigate('/dashboard?tab=mypayments'); s
        }, 4000); 
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Payment update failed');
      }
    } catch (error) {
      setError('Failed to complete payment update');
    }
  };

  if (loading) return <div className="text-center py-8">Loading order details...</div>;
  if (!order) return <div className="text-center py-8">Order not found</div>;

  const currentMember = order.members?.find(member => 
    member?.userId === currentUser?._id
  ) || null;

  if (!currentMember) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-center text-teal-600 mb-6">Payment Details</h2>
        <Alert color="failure" className="max-w-md mx-auto">
          You are not part of this order.
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500">
              ✓
            </div>
            <div className="ml-3 text-sm font-normal">
              Payment slip uploaded successfully!
            </div>
            <Toast.Toggle onDismiss={() => setShowSuccessToast(false)} />
          </Toast>
        </div>
      )}

      <h2 className="text-3xl font-bold text-center text-teal-600 mb-6">Payment Details</h2>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-2">Order Summary</h3>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Activity:</span> {order.itinerary?.title || 'N/A'}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Date:</span> {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Total Amount:</span> ${order.totalAmount?.toFixed(2) || '0.00'}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Cost per person:</span> ${(order.totalAmount / order.numberOfMembers)?.toFixed(2) || '0.00'}
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Payment Status</h3>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            <span className="font-semibold">Your Status:</span>
            <Badge color={currentMember.paymentStatus === 'paid' ? 'success' : 'warning'} className="ml-2">
              {currentMember.paymentStatus?.toUpperCase() || 'PENDING'}
            </Badge>
          </p>
          
          {currentMember.paymentStatus === 'paid' && currentMember.paymentSlip && (
            <div className="mt-3">
              <p className="font-semibold">Payment Slip:</p>
              <img 
                src={currentMember.paymentSlip} 
                alt="Payment Slip" 
                className="w-full max-w-xs border rounded mt-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x150?text=Slip+Not+Found';
                }}
              />
            </div>
          )}
        </div>

        {currentMember.paymentStatus === 'pending' && (
          <div>
            <h4 className="text-lg font-medium mb-3">Upload Payment Slip</h4>
            
            <div className="flex flex-col sm:flex-row gap-2 items-center mb-3">
              <FileInput 
                type="file" 
                accept="image/*,.pdf" 
                onChange={handleFileChange} 
                className="w-full sm:w-auto" 
              />
              <Button 
                onClick={handleUploadPaymentSlip} 
                type="button" 
                gradientDuoTone="purpleToBlue"
                disabled={!!imageUploadProgress}
              >
                {imageUploadProgress ? 'Uploading...' : 'Upload Slip'}
              </Button>
            </div>

            {imageUploadProgress && (
              <div className="w-16 h-16 mb-3">
                <CircularProgressbar 
                  value={imageUploadProgress} 
                  text={`${imageUploadProgress}%`} 
                />
              </div>
            )}

            {imageUploadError && (
              <Alert color="failure" className="mb-3">
                {imageUploadError}
              </Alert>
            )}
          </div>
        )}

        {error && (
          <Alert color="failure" className="mb-3">
            {error}
          </Alert>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Group Members</h3>
        <div className="space-y-2">
          {order.members?.map((member, index) => (
            <div key={member?.userId || index} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">{member?.username || 'Unknown User'}</p>
                <p className="text-sm text-gray-600">{member?.email || 'No email'}</p>
              </div>
              <Badge color={member?.paymentStatus === 'paid' ? 'success' : 'warning'}>
                {member?.paymentStatus?.toUpperCase() || 'PENDING'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}