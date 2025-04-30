import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";

export default function Itinerary() {
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
        const sortedData = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setItineraries(sortedData);
      }
    } catch (error) {
      console.error("Error fetching itineraries:", error);
    }
  };

  const handleAddTrip = (itineraryId) => {
    navigate(`/order/${itineraryId}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-teal-600 mb-6">
        Trip Itinerary
      </h2>
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
            <div
              key={itinerary._id}
              data-aos="fade-up"
              className="group relative shadow-lg rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300"
            >
              <img
                src={itinerary.image}
                alt={itinerary.title}
                className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 truncate">
                  {itinerary.title}
                </h3>
                <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-1">
                  {itinerary.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>📍 Location:</strong> {itinerary.location}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>⏲️ Duration:</strong> {itinerary.averageTime}
                </p>
                <p className="text-lg text-teal-700 font-semibold mt-3">
                  {"Rs. "}
                  {itinerary.averageCost}
                  {".00 "}
                  <span className="text-sm">Per Person</span>
                </p>
                <button
                  onClick={() => handleAddTrip(itinerary._id)}
                  className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all duration-200"
                >
                  Add to Trip
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-3 text-center text-gray-600 py-10 text-lg">
            No itineraries available at the moment. Please check back later.
          </p>
        )}
      </div>
    </div>
  );
}
