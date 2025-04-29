import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const MyPayments = ({ userId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  // console.log(currentUser?._id);

  useEffect(() => {
    // Fetch payment status data from API using fetch
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="mx-auto">
      <h1 className="text-3xl font-semibold mb-6">My Payments</h1>
      {payments.length === 0 ? (
        <p className="text-lg text-gray-500">You have no payments.</p>
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
            {payments.map((payment) => (
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
                <td className="px-6 py-4 border-t">
                  {payment.paymentStatus === "pending" && (
                    <Link
                      to={`/payment/${payment.orderId}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all"
                    >
                      Pay Now
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyPayments;
