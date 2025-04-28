/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const ExAdd = () => {
    const [files, setFiles] = useState([]);
    const [per, setPer] = useState(null);
    const [formData, setFormData] = useState({
        Expense_Type: "",
        Amount: 0,
        Currency: "",
        Payer: "",
        Date: "",
        Note: "",

    });

    useEffect(() => {
        const uploadFile = async () => {
            const uploadedImages = [];

            for (const file of files) {
                const name = `Expenses/${new Date().getTime()}_${file.name}`;
                const storageRef = ref(storage, name);
                const uploadTask = uploadBytesResumable(storageRef, file);

                await new Promise((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress =
                                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setPer(progress);
                        },
                        (error) => reject(error),
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            uploadedImages.push(downloadURL);
                            resolve();
                        }
                    );
                });
            }

            setFormData((prev) => ({ ...prev, img: uploadedImages }));
        };

        if (files.length > 0) {
            uploadFile();
        }
    }, [files]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        setFormData({
            Expense_Type: "",
            Amount: 0,
            Currency: "",
            Payer: "",
            Date: "",
            Note: "",
            img: [],
        });
        setFiles([]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await addDoc(collection(db, "Expenses"), {
                ...formData,
                Amount: parseFloat(formData.Amount), // Ensure amount is stored as a number
                timeStamp: serverTimestamp(),
            });

            handleReset();
            alert("Expense added successfully!");
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    return (
        <div className="bg-green-600 min-h-screen flex justify-center items-center">
            <div className="w-full max-w-lg flex justify-center items-center">
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full">
                    <div className="items-center flex justify-center mb-10">
                        <h1 className="text-green-700 underline text-lg font-bold">
                            Add Expense
                        </h1>
                    </div>

                    {/* Expense Type */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Expense Type
                        </label>
                        <select
                            name="Expense_Type"
                            value={formData.Expense_Type}
                            onChange={handleInputChange}
                            className="w-full shadow border rounded py-2 px-3 text-gray-700"
                        >
                            <option value="" disabled>Select Expense Type</option>
                            <option value="Food">Food</option>
                            <option value="Travel">Travel</option>
                            <option value="Rent">Rent</option>
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Amount
                        </label>
                        <input
                            name="Amount"
                            value={formData.Amount}
                            onChange={handleInputChange}
                            className="w-full shadow border rounded py-2 px-3 text-gray-700"
                            type="number"
                            placeholder="Enter amount"
                        />
                    </div>

                    {/* Currency */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Currency
                        </label>
                        <input
                            name="Currency"
                            value={formData.Currency}
                            onChange={handleInputChange}
                            className="w-full shadow border rounded py-2 px-3 text-gray-700"
                            type="text"
                            placeholder="USD, EUR, etc."
                        />
                    </div>

                    {/* Payer */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Payer
                        </label>
                        <select
                            name="Payer"
                            value={formData.Payer}
                            onChange={handleInputChange}
                            className="w-full shadow border rounded py-2 px-3 text-gray-700"
                        >
                            <option value="" disabled>Select Payer</option>
                            <option value="John Doe">John Doe</option>
                            <option value="Jane Smith">Jane Smith</option>
                        </select>
                    </div>

                    {/* Date */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Date
                        </label>
                        <input
                            name="Date"
                            value={formData.Date}
                            onChange={handleInputChange}
                            className="w-full shadow border rounded py-2 px-3 text-gray-700"
                            type="date"
                        />
                    </div>

                    {/* Note */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Note
                        </label>
                        <textarea
                            name="Note"
                            value={formData.Note}
                            onChange={handleInputChange}
                            className="w-full shadow border rounded py-2 px-3 text-gray-700"
                            placeholder="Enter note"
                        />
                    </div>



                    {/* Submit Button */}
                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExAdd;
