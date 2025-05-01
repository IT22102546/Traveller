import React, { useState, useEffect } from "react";

function DashCompletedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/orders/orders/completed", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data.orders) ? data.orders : []);

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load completed orders.");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete order.");
      }

      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      alert("Order deleted.");
    } catch (err) {
      console.error(err);
      alert("Error deleting order.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="mx-auto">
      <h1 className="text-3xl font-semibold mb-6 mt-10">Completed Orders</h1>
      {orders.length === 0 ? (
        <p className="text-lg text-gray-500">No completed orders found.</p>
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
                <td className="px-6 py-4 border-t text-green-600 font-semibold">
                  {order.orderStatus}
                </td>
                <td className="px-6 py-4 border-t">
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

export default DashCompletedOrders;
