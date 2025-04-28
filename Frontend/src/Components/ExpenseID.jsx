/* eslint-disable no-unused-vars */
import React from 'react';

const ExID = () => {
    return (
        <div className="bg-green-600 min-h-screen flex justify-center items-center">
            <div className="w-full max-w-lg flex justify-center items-center">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full">
                    <div className="items-center flex justify-center mb-10">
                        <h1 className="text-green-700 underline text-lg font-bold">
                            Edit Expense
                        </h1>

                    </div>
                    {/* Expense Type */}
                    <div className="mb-4 grid grid-cols-3 items-center gap-4">
                        <label className="text-gray-700 text-sm font-bold" htmlFor="expenseType">
                            Expense Type
                        </label>
                        <select
                            className="shadow border rounded col-span-2 py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline w-full"
                            id="expenseType"
                            defaultValue=""
                        >
                            <option value="" disabled>Select Expense Type</option>
                            <option>Food</option>
                            <option>Travel</option>
                            <option>Rent</option>
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="mb-4 grid grid-cols-3 items-center gap-4">
                        <label className="text-gray-700 text-sm font-bold" htmlFor="amount">
                            Amount
                        </label>
                        <input
                            className="shadow border rounded col-span-2 py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline w-full"
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                        />
                    </div>

                    {/* Currency */}
                    <div className="mb-4 grid grid-cols-3 items-center gap-4">
                        <label className="text-gray-700 text-sm font-bold" htmlFor="currency">
                            Currency
                        </label>
                        <input
                            className="shadow border rounded col-span-2 py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline w-full"
                            id="currency"
                            type="text"
                            placeholder="USD, EUR, etc."
                        />
                    </div>

                    {/* Payer */}
                    <div className="mb-4 grid grid-cols-3 items-center gap-4">
                        <label className="text-gray-700 text-sm font-bold" htmlFor="payer">
                            Payer
                        </label>
                        <select
                            className="shadow border rounded col-span-2 py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline w-full"
                            id="payer"
                            defaultValue=""
                        >
                            <option value="" disabled>Select Payer</option>
                            <option>John Doe</option>
                            <option>Jane Smith</option>
                        </select>
                    </div>

                    {/* Date */}
                    <div className="mb-4 grid grid-cols-3 items-center gap-4">
                        <label className="text-gray-700 text-sm font-bold" htmlFor="date">
                            Date
                        </label>
                        <input
                            className="shadow border rounded col-span-2 py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline w-full"
                            id="date"
                            type="date"
                        />
                    </div>

                    {/* Note */}
                    <div className="mb-4 grid grid-cols-3 items-center gap-4">
                        <label className="text-gray-700 text-sm font-bold" htmlFor="note">
                            Note
                        </label>
                        <textarea
                            className="shadow border rounded col-span-2 py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline w-full"
                            id="note"
                            placeholder="Enter note"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                        >
                            save changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExID;
