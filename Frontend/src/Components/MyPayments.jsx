import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf"; // Import jsPDF

const MyPayments = ({ userId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${currentUser?._id}/my-payments`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setPayments(data.userPayments); // Assuming the response contains an array of payment info
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching payments:", error.message);
        setError("Failed to load payments. Please try again later.");
        setLoading(false);
      });
  }, [userId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.itinerary.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.orderId.toString().includes(searchTerm)
  );

  // Generate PDF Report
  const generateReport = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("My Payments Report", 14, 20);

    // Add filter/search term to the report
    doc.setFontSize(12);
    doc.text(`Search Term: ${searchTerm || "All"}`, 14, 30);

    // Add table header

    doc.text("Itinerary", 40, 40);
    doc.text("Total Amount", 100, 40);
    doc.text("Your Share", 140, 40);
    doc.text("Payment Status", 180, 40);

    // Add payment data
    let yPosition = 50;
    filteredPayments.forEach((payment) => {
      doc.text(payment.itinerary.title, 40, yPosition);
      doc.text(payment.totalAmount.toString(), 100, yPosition);
      doc.text(payment.paymentShare.toString(), 140, yPosition);
      doc.text(payment.paymentStatus, 180, yPosition);
      yPosition += 10;
    });

    // Save the document as a PDF
    doc.save("my_payments_report.pdf");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="mx-auto">
      <h1 className="text-3xl font-semibold mb-6 mt-10">My Payments</h1>

      {/* Search Input */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search by Order ID or Itinerary..."
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

      {filteredPayments.length === 0 ? (
        <p className="text-lg text-gray-500">
          You have no payments matching the search.
        </p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100 text-left text-sm text-gray-600">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Itinerary</th>
              <th className="px-6 py-3">Total Amount</th>
              <th className="px-6 py-3">Your Share</th>
              <th className="px-6 py-3">Payment Status</th>
              <th className="px-6 py-3">Payment Slip</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredPayments.map((payment) => (
              <tr
                key={payment.orderId}
                className="hover:bg-gray-50 transition-all duration-200"
              >
                <td className="px-6 py-4 border-t">{payment.orderId}</td>
                <td className="px-6 py-4 border-t">
                  {payment.itinerary.title}
                </td>
                <td className="px-6 py-4 border-t">{payment.totalAmount}</td>
                <td className="px-6 py-4 border-t">{payment.paymentShare}</td>
                <td className="px-6 py-4 border-t">
                  <span
                    className={`${
                      payment.paymentStatus === "paid"
                        ? "text-green-500"
                        : "text-red-500"
                    } font-semibold`}
                  >
                    {payment.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 border-t">
                  {payment.paymentSlip ? (
                    <a
                      href={payment.paymentSlip}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Payment Slip
                    </a>
                  ) : (
                    <span className="text-gray-500">No Slip</span>
                  )}
                </td>
                <td className="px-6 py-4 border-t space-x-2">
                  {payment.paymentStatus === "pending" && (
                    <Link
                      to={`/payment/${payment.orderId}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Pay Now
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      const fullOrder = payments.find(
                        (p) => p.orderId === payment.orderId
                      );
                      setSelectedOrder(fullOrder);
                      setShowModal(true);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Trip Details</h2>
            <p>
              <strong>Itinerary:</strong> {selectedOrder.itinerary?.title}
            </p>
            <p>
              <strong>Total Amount:</strong> Rs. {selectedOrder.totalAmount}
            </p>
            <p className="mt-4 font-semibold">Member Payments:</p>
            <ul className="mt-2 space-y-1">
              {selectedOrder.members?.map((member, idx) => (
                <li key={idx} className="flex justify-between border-b py-1">
                  <span>
                    {member.username} ({member.email})
                  </span>
                  <span
                    className={
                      member.paymentStatus === "paid"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {member.paymentStatus} - Rs. {member.paymentShare}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayments;
