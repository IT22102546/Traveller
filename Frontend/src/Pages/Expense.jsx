import React, { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Button } from 'flowbite-react';
import { PieChart } from '@mui/x-charts/PieChart';
import { FaWindowClose } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';

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
  const reportRef = useRef();

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses();
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

  const generatePDF = () => {
    const element = document.createElement('div');
    element.style.padding = '20px';
    
    // Add title and date
    const title = document.createElement('h1');
    title.textContent = 'Expense Report';
    title.style.textAlign = 'center';
    title.style.fontSize = '24px';
    title.style.marginBottom = '20px';
    element.appendChild(title);

    const date = document.createElement('p');
    date.textContent = `Generated on ${new Date().toLocaleDateString()}`;
    date.style.textAlign = 'center';
    date.style.marginBottom = '30px';
    element.appendChild(date);

    // Add pie chart section
    if (expenses.length > 0) {
      const chartSection = document.createElement('div');
      chartSection.innerHTML = `
        <div style="display: flex; justify-content: center; margin-bottom: 30px;">
          <div style="width: 400px; height: 300px;">
            <!-- Chart will be rendered here -->
          </div>
        </div>
      `;
      element.appendChild(chartSection);

      // Add expense breakdown
      const breakdownSection = document.createElement('div');
      breakdownSection.innerHTML = `
        <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Expense Breakdown</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px;">
          ${chartData.map(item => `
            <div style="background: #f9f9f9; padding: 12px; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 500;">${item.label}</span>
                <span style="font-weight: 700;">
                  ${expenses[0]?.currency || 'LKR'} ${item.value.toFixed(2)}
                </span>
              </div>
              <div style="width: 100%; background: #e0e0e0; border-radius: 4px; height: 6px;">
                <div style="background: #0d9488; height: 100%; border-radius: 4px; width: ${(item.value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      element.appendChild(breakdownSection);

      // Add transaction details
      const transactionsSection = document.createElement('div');
      transactionsSection.innerHTML = `
        <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Transaction Details</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Category</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Amount</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Note</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map((expense, index) => `
              <tr style="background: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(expense.date).toLocaleDateString()}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${expense.label}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${expense.currency} ${expense.value.toFixed(2)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${expense.note || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      element.appendChild(transactionsSection);

      // Add total expenses
      const totalSection = document.createElement('div');
      totalSection.innerHTML = `
        <div style="background: #f0f0f0; padding: 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700;">Total Expenses:</span>
          <span style="font-weight: 700; font-size: 20px;">
            ${expenses[0]?.currency || 'LKR'} ${expenses.reduce((sum, expense) => sum + expense.value, 0).toFixed(2)}
          </span>
        </div>
      `;
      element.appendChild(totalSection);
    } else {
      const noData = document.createElement('p');
      noData.textContent = 'No expense data available for report';
      noData.style.textAlign = 'center';
      noData.style.padding = '40px 0';
      noData.style.color = '#666';
      element.appendChild(noData);
    }

    // PDF options
    const opt = {
      margin: 10,
      filename: 'expense_report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        logging: true,
        useCORS: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-teal-600 mb-6">Expense Management</h2>
      
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="flex">
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-4 py-2 rounded-l-lg w-full shadow-md focus:outline-none"
            />
            <Button 
              type="submit"
              color="light"
              className="rounded-r-lg rounded-l-none border-l-0"
              onClick={(e) => e.stopPropagation()}
            >
              Search
            </Button>
          </div>
        </form>
        <div className="flex gap-4">
          <Button 
            color="success" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAddModal(true);
            }}
          >
            Add Expense ➜
          </Button>
          <Button 
            color="purple" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowReportModal(true);
            }}
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditClick(expense);
                  }}
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button 
                  color="failure" 
                  size="xs" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteExpense(expense._id);
                  }}
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-teal-600">Add New Expense</h3>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddModal(false);
                }}
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-teal-600">Edit Expense</h3>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowEditModal(false);
                }}
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReportModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-2 z-10">
              <h3 className="text-xl font-bold text-teal-600">Expense Report</h3>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowReportModal(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              {expenses.length > 0 ? (
                <div className="space-y-6">
                  {/* Chart Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-4 text-center">Expense Distribution</h4>
                    <div className="flex justify-center">
                      <div className="w-full max-w-xs h-64 sm:max-w-sm sm:h-80">
                        <PieChart
                          series={[
                            {
                              data: chartData,
                              innerRadius: 30,
                              outerRadius: 100,
                              paddingAngle: 5,
                              cornerRadius: 5,
                            }
                          ]}
                          width={400}
                          height={300}
                          slotProps={{
                            legend: {
                              direction: 'row',
                              position: { vertical: 'bottom', horizontal: 'middle' },
                              padding: 0,
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-3">Expense Breakdown</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {chartData.map((item) => (
                        <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{item.label}</span>
                            <span className="font-bold">
                              {expenses[0]?.currency || 'LKR'} {item.value.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-teal-600 h-2 rounded-full" 
                              style={{ width: `${(item.value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-right text-sm text-gray-500 mt-1">
                            {((item.value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transactions Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-3">Transaction Details</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-2 px-3 border text-left text-sm font-medium text-gray-700">Date</th>
                            <th className="py-2 px-3 border text-left text-sm font-medium text-gray-700">Category</th>
                            <th className="py-2 px-3 border text-left text-sm font-medium text-gray-700">Amount</th>
                            <th className="py-2 px-3 border text-left text-sm font-medium text-gray-700">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map((expense, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="py-2 px-3 border text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                              <td className="py-2 px-3 border text-sm">{expense.label}</td>
                              <td className="py-2 px-3 border text-sm font-medium">
                                {expense.currency} {expense.value.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 border text-sm text-gray-600">{expense.note || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Total Section */}
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-teal-800">Total Expenses:</span>
                      <span className="font-bold text-xl text-teal-600">
                        {expenses[0]?.currency || 'LKR'} {expenses.reduce((sum, expense) => sum + expense.value, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No expense data available for report</p>
                </div>
              )}
            </div>

            {/* Footer with action buttons */}
            <div className="mt-4 flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
              <Button 
                color="gray" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowReportModal(false);
                }}
                className="px-4"
              >
                Close
              </Button>
              <Button 
                color="blue" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  generatePDF();
                }}
                className="px-4"
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}