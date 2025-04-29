import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function FullPaymentRecievedTrips() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the route that gets orders where payment status is paid
    fetch("/api/orders/orders/pending-with-paid-members")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setOrders(data.orders); // Assuming the response contains an array of orders
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error.message);
        setError("Failed to load orders. Please try again later.");
        setLoading(false);
      });
  }, []);

  const handleEdit = (orderId) => {
    // Handle edit logic here (you can redirect or open a modal)
    console.log("Edit order with ID:", orderId);
  };

  const handleDelete = (orderId) => {
    // Handle delete logic here
    console.log("Delete order with ID:", orderId);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="mx-auto ">
      <h1 className="text-3xl font-semibold mb-6 mt-10">
        Full Payment Received Trips
      </h1>
      {orders.length === 0 ? (
        <p className="text-lg text-gray-500">
          No full payment received trips found.
        </p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100 text-left text-sm text-gray-600">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Itinerary</th>
              <th className="px-6 py-3">Total Amount</th>
              <th className="px-6 py-3">Order Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {orders.map((order) => (
              <tr
                key={order._id}
                className="hover:bg-gray-50 transition-all duration-200"
              >
                <td className="px-6 py-4 border-t">{order._id}</td>
                <td className="px-6 py-4 border-t">{order.itinerary.title}</td>
                <td className="px-6 py-4 border-t">{order.totalAmount}</td>
                <td className="px-6 py-4 border-t">{order.orderStatus}</td>
                <td className="px-6 py-4 border-t">
                  <button
                    onClick={() => handleEdit(order._id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FullPaymentRecievedTrips;
