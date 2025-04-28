// OrderSummary.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { useSelector } from 'react-redux';

export default function OrderSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useSelector(state => state.user);
  const [formData, setFormData] = useState({
    date: '',
    numberOfMembers: 1
  });

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await fetch(`/api/itinary/${id}`);
        const data = await res.json();
        if (res.ok) {
          setItinerary(data);
        }
      } catch (error) {
        console.error('Error fetching itinerary:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/user/users');
        const data = await res.json();
        if (res.ok) {
          setAllUsers(data);
          setFilteredUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchItinerary();
    fetchUsers();
  }, [id]);

  useEffect(() => {
    if (currentUser && formData.numberOfMembers >= 1 && selectedUsers.length === 0) {
      setSelectedUsers([currentUser._id]);
    }
  }, [currentUser, formData.numberOfMembers]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, allUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfMembers' ? Math.max(1, parseInt(value) || 1) : value
    }));

    if (name === 'numberOfMembers') {
      setSelectedUsers(currentUser ? [currentUser._id] : []);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const addUser = (userId) => {
    if (!selectedUsers.includes(userId) && selectedUsers.length < formData.numberOfMembers) {
      setSelectedUsers([...selectedUsers, userId]);
      setSearchTerm('');
    }
  };

  const removeUser = (userId) => {
    if (userId !== currentUser._id) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const costPerPerson = parseFloat(itinerary.averageCost.replace(/[^0-9.]/g, ''));
      const totalAmount = costPerPerson * formData.numberOfMembers;
  
      // Prepare member details (simplified from your original)
      const memberDetails = selectedUsers.map(userId => {
        const user = allUsers.find(u => u._id === userId);
        return {
          userId: user._id,
          username: user.username,
          email: user.email,
          paymentStatus: 'pending'
        };
      });
  
      const orderData = {
        itinerary: itinerary._id, // Just send the ID, let backend populate
        date: formData.date,
        numberOfMembers: formData.numberOfMembers,
        members: memberDetails,
        totalAmount,
        createdBy: currentUser._id
      };
  
      // Make the API call to create the order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
        },
        body: JSON.stringify(orderData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
  
      const createdOrder = await response.json();
      navigate(`/payment/${createdOrder._id}`); // Navigate to payment with order ID
  
    } catch (error) {
      console.error('Order creation failed:', error);
      // Add error handling UI here
    }
  };

  // ✅ Check if the form is fully valid
  const isFormValid = () => {
    const today = new Date().toISOString().split('T')[0];
    return (
      formData.date &&
      formData.date >= today &&
      formData.numberOfMembers > 0 &&
      selectedUsers.length === formData.numberOfMembers
    );
  };

  if (!itinerary) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-teal-600 mb-6">Order Summary</h2>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-2">{itinerary.title}</h3>
        <p className="text-gray-600 mb-4">{itinerary.location}</p>
        <p className="text-gray-800 font-bold">Cost Per Person: {itinerary.averageCost}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Trip Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Number of Members</label>
          <input
            type="number"
            name="numberOfMembers"
            value={formData.numberOfMembers}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
            min={1}
          />
        </div>

        {formData.numberOfMembers > 1 && (
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              Select Members ({selectedUsers.length}/{formData.numberOfMembers})
            </label>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedUsers.map(userId => {
                  const user = allUsers.find(u => u._id === userId);
                  return user ? (
                    <div
                      key={userId}
                      className="bg-teal-100 rounded-full px-3 py-1 flex items-center"
                    >
                      <span className="mr-2">{user.username}</span>
                      {userId !== currentUser._id && (
                        <button
                          type="button"
                          onClick={() => removeUser(userId)}
                          className="text-teal-700 hover:text-teal-900"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ) : null;
                })}
              </div>
            )}

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users by name or email"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full p-2 border rounded"
                disabled={selectedUsers.length >= formData.numberOfMembers}
              />
            </div>

            {searchTerm && selectedUsers.length < formData.numberOfMembers && (
              <div className="max-h-60 overflow-y-auto border rounded p-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers
                    .filter(user => !selectedUsers.includes(user._id))
                    .map(user => (
                      <div
                        key={user._id}
                        className="p-2 mb-2 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => addUser(user._id)}
                      >
                        {user.username} ({user.email})
                      </div>
                    ))
                ) : (
                  <div className="p-2 text-gray-500">No users found</div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">Payment Summary</h4>
          <p>Cost per person: {itinerary.averageCost}</p>
          <p>Number of people: {formData.numberOfMembers}</p>
          <p className="font-bold mt-2">
            Total Amount: {parseFloat(itinerary.averageCost.replace(/[^0-9.]/g, '')) * formData.numberOfMembers} {itinerary.averageCost.replace(/[0-9.,]/g, '')}
          </p>
        </div>

        <Button
          type="submit"
          color="success"
          className="w-full"
          disabled={!isFormValid()} // ✅ disable button if form invalid
        >
          Proceed to Payment
        </Button>
      </form>
    </div>
  );
}
