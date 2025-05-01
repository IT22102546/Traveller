import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function FullPaymentRecievedTrips() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "/api/orders/orders/pending-with-paid-members",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 404) {
          // No matching orders found — not a real error
          setOrders([]);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          if (response.status === 401) {
            setError("Your session has expired. Please log in again.");
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setOrders(data.orders || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error.message);
        setError("An unexpected error occurred. Please try again later.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleMarkAsPaid = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/mark-as-paid`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to mark order as paid");
      }

      alert("Order marked as paid!");

      // Refresh the list
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: "paid" } : order
        )
      );
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <div className="text-red-600 text-center mt-10 mx-auto my-auto">
        {error}
        {error.toLowerCase().includes("log in") && (
          <div className="mt-4 ">
            <Link to="/sign-in" className=" text-white ">
              <button className="bg-green-600 hover:text-bg-800 hover:cursor-pointer p-2 rounded-xl">
                Go to Login
              </button>
            </Link>
          </div>
        )}
      </div>
    );

  return (
    <div className="mx-auto">
      <h1 className="text-3xl font-semibold mb-6 mt-10">
        Full Payment Received Trips
      </h1>

      {orders.length === 0 ? (
        <p className="text-lg text-gray-500">
          There are no pending orders where all members have completed their
          payments.
        </p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100 text-left text-sm text-gray-600">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Itinerary</th>
              <th className="px-6 py-3">Total Amount</th>
              <th className="px-6 py-3">Members</th>
              <th className="px-6 py-3">Proof</th>
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

                {/* Members Count */}
                <td className="px-6 py-4 border-t">{order.members.length}</td>

                {/* Proof Column: list each paid member with a receipt */}
                <td className="px-6 py-4 border-t space-y-1">
                  {order.members
                    .filter((m) => m.paymentSlip)
                    .map((member, idx) => (
                      <div key={idx}>
                        <a
                          href={member.paymentSlip}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {member.username}'s slip
                        </a>
                      </div>
                    ))}
                </td>

                <td className="px-6 py-4 border-t text-red-700 font-semibold">
                  {order.orderStatus}
                </td>
                <td className="px-6 py-4 border-t">
                  <button
                    onClick={() => handleMarkAsPaid(order._id)}
                    className="bg-green-600 text-white px-4 py-2 mr-1 rounded hover:bg-green-700 transition-all"
                  >
                    Mark as Paid
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
