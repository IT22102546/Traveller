import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, FileInput, Badge, Toast } from 'flowbite-react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useSelector } from 'react-redux';
import { HiCheck, HiOutlineExclamation, HiOutlineArrowLeft } from 'react-icons/hi';

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
    setImageUploadError(null);
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
          navigate('/dashboard?tab=mypayments');
        }, 3000); 
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Payment update failed');
      }
    } catch (error) {
      setError('Failed to complete payment update');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600 mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <HiOutlineExclamation className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Order not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested order could not be found in our system.</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/dashboard')} gradientDuoTone="tealToLime">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );

  const currentMember = order.members?.find(member => 
    member?.userId === currentUser?._id
  ) || null;

  if (!currentMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <HiOutlineExclamation className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You are not part of this order.</p>
          <div className="mt-6">
            <Button onClick={() => navigate('/dashboard')} gradientDuoTone="tealToLime">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50">
          <Toast className="border border-green-300 bg-green-50">
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-medium text-green-700">
              Payment slip uploaded successfully!
            </div>
            <Toast.Toggle 
              onDismiss={() => setShowSuccessToast(false)} 
              className="ml-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 hover:bg-green-100 focus:ring-2 focus:ring-green-400 p-1.5 rounded-lg"
            />
          </Toast>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            onClick={() => navigate(-1)} 
            gradientDuoTone="tealToLime" 
            outline
            className="flex items-center gap-1"
          >
            <HiOutlineArrowLeft className="h-5 w-5" />
            Back
          </Button>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold">Payment Details</h1>
            <p className="text-teal-100 mt-1">Complete your payment for the trip</p>
          </div>

          {/* Main Content */}
          <div className="p-6 md:p-8 space-y-8">
            {/* Order Summary Card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-800">Activity:</span> {order.itinerary?.title || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-800">Date:</span> {order.date ? new Date(order.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-800">Total Amount:</span> Rs.{order.totalAmount?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-800">Cost per person:</span> Rs.{(order.totalAmount / order.numberOfMembers)?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Status Card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Payment Status</h2>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-600">Status:</p>
                </div>
                <Badge 
                  color={currentMember.paymentStatus === 'paid' ? 'success' : 'warning'} 
                  size="lg"
                  className="px-4 py-1.5"
                >
                  {currentMember.paymentStatus?.toUpperCase() || 'PENDING'}
                </Badge>
              </div>

              {currentMember.paymentStatus === 'paid' && currentMember.paymentSlip && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-800 mb-2">Payment Receipt</h3>
                  <div className="border rounded-lg p-3 bg-white">
                    <img 
                      src={currentMember.paymentSlip} 
                      alt="Payment Slip" 
                      className="w-full max-w-md mx-auto"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/600x300?text=Receipt+Not+Found';
                      }}
                    />
                  </div>
                </div>
              )}

              {currentMember.paymentStatus === 'pending' && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Upload Payment Slip</h3>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <FileInput 
                        id="payment-slip"
                        helperText="Upload an image or PDF of your payment slip"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="w-full"
                      />
                      <Button 
                        onClick={handleUploadPaymentSlip} 
                        gradientDuoTone="tealToLime"
                        disabled={!file || !!imageUploadProgress}
                        className="w-full sm:w-auto"
                      >
                        {imageUploadProgress ? 'Uploading...' : 'Submit Payment'}
                      </Button>
                    </div>

                    {imageUploadProgress && (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16">
                          <CircularProgressbar 
                            value={imageUploadProgress} 
                            text={`${imageUploadProgress}%`} 
                            styles={{
                              path: { stroke: '#0d9488' },
                              text: { fill: '#0d9488', fontSize: '24px' }
                            }}
                          />
                        </div>
                        <p className="text-gray-600">Uploading your payment slip...</p>
                      </div>
                    )}

                    {imageUploadError && (
                      <Alert color="failure" className="mt-4">
                        <span className="font-medium">Error!</span> {imageUploadError}
                      </Alert>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <Alert color="failure" className="mt-6">
                  <span className="font-medium">Error!</span> {error}
                </Alert>
              )}
            </div>

            {/* Group Members Card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Group Members</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.members?.map((member, index) => (
                      <tr key={member?.userId || index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-medium">
                              {member?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member?.username || 'Unknown User'}</div>
                              <div className="text-sm text-gray-500">{member?.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            color={member?.paymentStatus === 'paid' ? 'success' : 'warning'} 
                            size="sm"
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full"
                          >
                            {member?.paymentStatus?.toUpperCase() || 'PENDING'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}