import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

export default function Itinerary() {
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchItineraries();
  }, [searchTerm]);

  const fetchItineraries = async () => {
    try {
      const res = await fetch(`/api/itinary?searchTerm=${searchTerm}`);
      const data = await res.json();
      if (res.ok) {
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setItineraries(sortedData);
      }
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    }
  };

  const handleAddTrip = (itineraryId) => {
    navigate(`/order/${itineraryId}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-teal-600 mb-6">Trip Itinerary</h2>
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search activity"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded-lg w-80 shadow-md focus:outline-none"
        />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {itineraries.length > 0 ? (
          itineraries.map((itinerary) => (
            <div key={itinerary._id} data-aos="fade-up" className="shadow-lg m-4 rounded-lg p-2 bg-pink-100">
              <img src={itinerary.image} alt={itinerary.title} className="w-full h-48 object-cover object-top rounded-md" />
              <h3 className="text-xl font-semibold mt-3 text-teal-900">{itinerary.title}</h3>
              <p className="text-sm text-teal-500 mt-4">{itinerary.categories.join('/ ')}</p>
              <p className="text-teal-500">{itinerary.location}</p>
              <p className="text-teal-500">{itinerary.averageTime}</p>
              <p className="text-gray-800 font-bold mt-4">{itinerary.averageCost} Per Pesron</p>
              <Button 
                color="success" 
                className="mt-3 mb-2 w-full"
                onClick={() => handleAddTrip(itinerary._id)}
              >
                ADD trip ➜
              </Button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No itineraries available</p>
        )}
      </div>
    </div>
  );
}