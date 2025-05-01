import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner, Alert } from 'flowbite-react';
import { HiOutlineUserAdd, HiOutlineX, HiOutlineCalendar, HiOutlineUsers, HiOutlineCash, HiOutlineCheckCircle } from 'react-icons/hi';
import { useSelector } from 'react-redux';

export default function OrderSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector(state => state.user);
  const [formData, setFormData] = useState({
    date: '',
    numberOfMembers: 1
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itineraryRes, usersRes] = await Promise.all([
          fetch(`/api/itinary/${id}`),
          fetch('/api/user/users')
        ]);

        if (!itineraryRes.ok || !usersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [itineraryData, usersData] = await Promise.all([
          itineraryRes.json(),
          usersRes.json()
        ]);

        setItinerary(itineraryData);
        setAllUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      setSelectedUsers(prev => prev.includes(currentUser._id) ? [currentUser._id] : []);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const addUser = (userId) => {
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers(prev => [...prev, userId]);
      setSearchTerm('');
    }
  };

  const removeUser = (userId) => {
    if (userId !== currentUser._id) {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const costPerPerson = parseFloat(itinerary.averageCost.replace(/[^0-9.]/g, ''));
      const totalAmount = costPerPerson * formData.numberOfMembers;

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
        itinerary: itinerary._id,
        date: formData.date,
        numberOfMembers: formData.numberOfMembers,
        members: memberDetails,
        totalAmount,
        createdBy: currentUser._id
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const createdOrder = await response.json();
      navigate(`/payment/${createdOrder._id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const today = new Date().toISOString().split('T')[0];
    return (
      formData.date &&
      formData.date >= today &&
      formData.numberOfMembers > 0 &&
      selectedUsers.length === formData.numberOfMembers
    );
  };

  if (loading && !itinerary) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert color="failure">
          {error}
        </Alert>
      </div>
    );
  }

  if (!itinerary) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Summary</h1>
          <p className="mt-2 text-lg text-gray-600">Review your trip details before proceeding to payment</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* Itinerary Summary Card */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{itinerary.title}</h2>
            <p className="text-teal-100 mb-4">{itinerary.location}</p>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-700 text-teal-100">
                <HiOutlineCheckCircle className="mr-1" />
                Available
              </span>
              <span className="text-xl font-semibold">{itinerary.averageCost} Per Person</span>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Date Selection */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <HiOutlineCalendar className="mr-2 text-teal-600" />
                    Trip Date
                  </h3>
                  <div className="mt-4">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Number of Members */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <HiOutlineUsers className="mr-2 text-teal-600" />
                    Group Size
                  </h3>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Travelers
                    </label>
                    <input
                      type="number"
                      name="numberOfMembers"
                      value={formData.numberOfMembers}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                      required
                      min={1}
                    />
                  </div>
                </div>

                {/* Member Selection */}
                {formData.numberOfMembers > 1 && (
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <HiOutlineUserAdd className="mr-2 text-teal-600" />
                      Select Group Members ({selectedUsers.length}/{formData.numberOfMembers})
                    </h3>
                    <div className="mt-4 space-y-4">
                      {/* Selected Users */}
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(userId => {
                          const user = allUsers.find(u => u._id === userId);
                          return user ? (
                            <div
                              key={userId}
                              className="inline-flex items-center bg-teal-100 text-teal-800 rounded-full px-3 py-1 text-sm font-medium"
                            >
                              {user.username}
                              {userId !== currentUser._id && (
                                <button
                                  type="button"
                                  onClick={() => removeUser(userId)}
                                  className="ml-1 text-teal-600 hover:text-teal-900"
                                >
                                  <HiOutlineX />
                                </button>
                              )}
                            </div>
                          ) : null;
                        })}
                      </div>

                      {/* User Search */}
                      {selectedUsers.length < formData.numberOfMembers && (
                        <div>
                          <input
                            type="text"
                            placeholder="Search users by name or email"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                          />
                        </div>
                      )}

                      {/* Search Results */}
                      {searchTerm && selectedUsers.length < formData.numberOfMembers && (
                        <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                          {filteredUsers.filter(user => !selectedUsers.includes(user._id)).length > 0 ? (
                            filteredUsers
                              .filter(user => !selectedUsers.includes(user._id))
                              .map(user => (
                                <div
                                  key={user._id}
                                  className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-0"
                                  onClick={() => addUser(user._id)}
                                >
                                  <div>
                                    <p className="font-medium text-gray-900">{user.username}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                  </div>
                                  <button
                                    type="button"
                                    className="text-teal-600 hover:text-teal-800"
                                  >
                                    <HiOutlineUserAdd />
                                  </button>
                                </div>
                              ))
                          ) : (
                            <div className="p-3 text-center text-gray-500">No users found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <HiOutlineCash className="mr-2 text-teal-600" />
                    Payment Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost per person:</span>
                      <span className="font-medium">Rs.{itinerary.averageCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of travelers:</span>
                      <span className="font-medium">{formData.numberOfMembers}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-semibold">Total Amount:</span>
                        <span className="text-xl font-bold text-teal-600">
                          Rs.{parseFloat(itinerary.averageCost.replace(/[^0-9.]/g, '')) * formData.numberOfMembers} 
                          {itinerary.averageCost.replace(/[0-9.,]/g, '')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    color="success"
                    className="w-full py-3 px-4 text-lg font-medium"
                    disabled={!isFormValid() || loading}
                    isProcessing={loading}
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}