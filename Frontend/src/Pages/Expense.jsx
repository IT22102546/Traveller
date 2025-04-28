import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Button } from 'flowbite-react';
import { PieChart } from '@mui/x-charts/PieChart';
import { FaWindowClose } from 'react-icons/fa';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    value: 0,
    date: new Date().toISOString().split('T')[0],
    currency: 'LKR',
    note: '' 
});

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchExpenses();
  }, [searchTerm]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`/api/expense?searchTerm=${searchTerm}`);
      const data = await res.json();
      if (res.ok) {
        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(sortedData);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          label: '',
          value: 0,
          date: new Date().toISOString().split('T')[0],
          currency: 'LKR',
          note: ''
        });
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/expense/${currentExpense._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentExpense),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const res = await fetch(`/api/expense/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEditClick = (expense) => {
    setCurrentExpense(expense);
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'value' ? Number(value) : value
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentExpense({
      ...currentExpense,
      [name]: name === 'value' ? Number(value) : value
    });
  };

  // Prepare data for PieChart
  const prepareChartData = () => {
    const categoryMap = {};
    
    expenses.forEach(expense => {
      if (categoryMap[expense.label]) {
        categoryMap[expense.label] += expense.value;
      } else {
        categoryMap[expense.label] = expense.value;
      }
    });

    return Object.keys(categoryMap).map((label, index) => ({
      id: index,
      value: categoryMap[label],
      label: label
    }));
  };

  const chartData = prepareChartData();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-teal-600 mb-6">Expense Management</h2>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded-lg w-full shadow-md focus:outline-none"
          />
        </div>
        <div className="flex gap-4">
          <Button 
            color="success" 
            onClick={() => setShowAddModal(true)}
          >
            Add Expense ➜
          </Button>
          <Button 
            color="purple" 
            onClick={() => setShowReportModal(true)}
          >
            View Report
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-1 gap-4">
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <div 
              key={expense._id} 
              data-aos="fade-up" 
              className="shadow-lg rounded-lg p-4 bg-white flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold text-teal-900">{expense.label}</h3>
                <p className="text-sm text-teal-500">{new Date(expense.date).toLocaleDateString()}</p>
                {expense.note && <p className="text-gray-600 mt-1">{expense.note}</p>}
              </div>
              <div className="flex items-center">
                <p className="text-gray-800 font-bold mr-4">
                  {expense.currency} {expense.value.toFixed(2)}
                </p>
                <Button 
                  color="warning" 
                  size="xs" 
                  onClick={() => handleEditClick(expense)}
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button 
                  color="failure" 
                  size="xs" 
                  onClick={() => handleDeleteExpense(expense._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No expenses available</p>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-teal-600">Add New Expense</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddExpense}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Expense Type</label>
                <select
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select type</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Activities">Activities</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Amount</label>
                <div className="flex">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="p-2 border rounded-l"
                  >
                    <option value="LKR">LKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="flex-1 p-2 border rounded-r"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Note (Optional)</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              <Button type="submit" color="success" className="w-full">
                Save Expense
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && currentExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-teal-600">Edit Expense</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateExpense}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Expense Type</label>
                <select
                  name="label"
                  value={currentExpense.label}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Activities">Activities</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Amount</label>
                <div className="flex">
                  <select
                    name="currency"
                    value={currentExpense.currency}
                    onChange={handleEditInputChange}
                    className="p-2 border rounded-l"
                  >
                    <option value="LKR">LKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <input
                    type="number"
                    name="value"
                    value={currentExpense.value}
                    onChange={handleEditInputChange}
                    className="flex-1 p-2 border rounded-r"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={currentExpense.date.split('T')[0]}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Note (Optional)</label>
                <textarea
                  name="note"
                  value={currentExpense.note}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              <Button type="submit" color="warning" className="w-full">
                Update Expense
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-teal-600">Expense Report</h3>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {expenses.length > 0 ? (
              <div className="flex flex-col items-center">
                <PieChart
                  series={[
                    {
                      data: chartData,
                      innerRadius: 30,
                      outerRadius: 100,
                      paddingAngle: 5,
                      cornerRadius: 5,
                      cx: 150,
                      cy: 150,
                    }
                  ]}
                  width={400}
                  height={300}
                />
                <div className="mt-4 w-full">
                  <h4 className="text-lg font-semibold mb-2">Expense Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chartData.map((item) => (
                      <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-medium">{item.label}</span>
                          <span className="font-bold">
                            {expenses[0]?.currency || 'LKR'} {item.value.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div 
                            className="bg-teal-600 h-2.5 rounded-full" 
                            style={{ width: `${(item.value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">No expense data available for report</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}