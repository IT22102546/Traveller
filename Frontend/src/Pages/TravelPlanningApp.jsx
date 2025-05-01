import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TravelPlanningApp = () => {
  const [budgetPerPerson, setBudgetPerPerson] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [budgetError, setBudgetError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const categories = [
    { id: 'Adventure', name: 'Adventure', icon: '🧗‍♂️' },
    { id: 'Culture', name: 'Culture', icon: '🏛️' },
    { id: 'Nature', name: 'Nature', icon: '🌿' },
    { id: 'Luxury', name: 'Luxury', icon: '✨' },
    { id: 'Food', name: 'Food', icon: '🍜' },
    { id: 'Relaxation', name: 'Relaxation', icon: '🧘‍♀️' },
  ];

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleRecommend = async () => {
    setBudgetError('');
    setCategoryError('');
    setError('');
    setRecommendations([]);
    
    if (!budgetPerPerson || isNaN(budgetPerPerson)) {
      setBudgetError('Please enter a valid budget per person.');
      return;
    }

    if (selectedCategories.length === 0) {
      setCategoryError('Please select at least one category.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/recomandation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget: parseFloat(budgetPerPerson),
          categories: selectedCategories
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }

      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.error || 'No recommendations found');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToTrip = (itineraryId) => {
    navigate(`/order/${itineraryId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600 mb-2">
              Sri Lanka Travel Planner
            </h1>
            <p className="text-gray-600 text-lg">
              Find your perfect trip based on budget and interests
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget per person (Rs)
              </label>
              <input
                type="number"
                value={budgetPerPerson}
                onChange={(e) => setBudgetPerPerson(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 shadow-sm"
                placeholder="Enter your budget per person"
                min="0"
              />
              {budgetError && <p className="mt-1 text-sm text-red-600">{budgetError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select your interests:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
                      selectedCategories.includes(category.id)
                        ? 'border-teal-500 bg-teal-50 shadow-md -translate-y-0.5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-1">{category.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  </button>
                ))}
              </div>
              {categoryError && <p className="mt-1 text-sm text-red-600">{categoryError}</p>}
            </div>

            <button
              onClick={handleRecommend}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finding Recommendations...
                </div>
              ) : (
                'Find My Trip'
              )}
            </button>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="border-t border-gray-200 p-8 bg-gray-50">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Recommended Itineraries</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={rec.image} 
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Destination+Image';
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {rec.location}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{rec.title}</h3>
                 
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Budget Per Person</p>
                        <p className="font-semibold text-gray-800">Rs {rec.averageCost.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-semibold text-gray-800">{rec.averageTime}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rec.categories.map(catId => {
                        const category = categories.find(c => c.id === catId);
                        return (
                          <span 
                            key={catId} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                          >
                            {category?.icon} {category?.name}
                          </span>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handleAddToTrip(rec._id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Add to Trip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelPlanningApp;