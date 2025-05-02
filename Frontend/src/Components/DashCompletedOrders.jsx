import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf"; // Import jsPDF

function DashCompletedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredOrders = orders.filter((order) =>
    order.itinerary.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Completed Orders Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Search Term: ${searchTerm || "All"}`, 14, 30);

    doc.text("Order ID", 14, 40);
    doc.text("Itinerary", 40, 40);
    doc.text("Total Amount", 100, 40);
    doc.text("Order Status", 160, 40);

    let yPosition = 50;
    filteredOrders.forEach((order) => {
      doc.text(order.itinerary.title, 40, yPosition);
      doc.text(order.totalAmount.toString(), 100, yPosition);
      doc.text(order.orderStatus, 160, yPosition);
      yPosition += 10;
    });

    doc.save("completed_orders_report.pdf");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="mx-auto">
      <h1 className="text-3xl font-semibold mb-6 mt-10">Completed Orders</h1>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search Itineraries..."
          value={searchTerm}
          onChange={handleSearch}
          className="px-3 py-2 w-96 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />

        {/* Generate Report Button */}
        <button
          onClick={generateReport}
          className="bg-green-500 hover:bg-green-600 px-4 rounded-xl text-white"
        >
          Generate Report
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-lg text-gray-500">
          No matching completed orders found.
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
            {filteredOrders.map((order) => (
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
