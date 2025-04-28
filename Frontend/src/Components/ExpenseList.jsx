/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { onConfirm } from "react-confirm-pro";
import { Link } from "react-router-dom";

const paginationModel = { page: 0, pageSize: 5 };

const Ex_list = () => {
    const [Cat_data, setCat_Data] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Category data
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "Expenses"), (snapshot) => {
            let list = snapshot.docs.map((doc, index) => ({
                id: doc.id, // Ensure every row has a unique id
                Row_id: index + 1,
                ...doc.data()
            }));
            setCat_Data(list);
        }, (error) => console.log(error));

        return () => unsub();
    }, []);

    // Search Filter
    const filtered_Category_Data = Cat_data.filter((Cat_row) =>
        ["id", "Expense_Type"].some(
            (field) =>
                Cat_row[field] && Cat_row[field].toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    // Delete Function
    const handleDelete_Cat = async (id) => {
        const defaultOptions = {
            title: <h3>Are you sure?</h3>,
            description: <p>Do you really want to delete this record? This process cannot be undone.</p>,
            onSubmit: async () => {
                try {
                    await deleteDoc(doc(db, "Expenses", id));
                    setCat_Data((prevData) => prevData.filter((item) => item.id !== id));
                } catch (error) {
                    console.log(error);
                }
            },
        };

        onConfirm({
            ...defaultOptions,
            type: "dark",
            btnSubmit: "Confirm",
            btnCancel: "Cancel",
        });
    };

    // Table Columns
    const Cat_columns = [
        { field: "Row_id", headerName: "Row", width: 65 },
        { field: "Expense_Type", headerName: "Expense Type", width: 160 },
        { field: "Payer", headerName: "Payer", width: 200 },
        { field: "Amount", headerName: "Amount", width: 200 },
        { field: "Date", headerName: "Date", width: 200 },
    ];

    // Action Column
    const actionColum_cat = [
        {
            field: "action",
            headerName: "Action",
            width: 160,
            renderCell: (params) => (
                <div className="cellAction flex items-center justify-around">
                    <div className="bg-green-600 rounded-md px-2">
                        <Link to={`/Expenses/${params.row.id}`} style={{ textDecoration: "none" }} state={{ id: params.row.id }}>
                            Edit
                        </Link>
                    </div>
                    <div className="bg-green-400 rounded-md px-2" onClick={() => handleDelete_Cat(params.row.id)}>
                        Delete
                    </div>
                </div>
            ),
        },
    ];

    // Use useMemo for columns to prevent re-creation on each render
    const columns = useMemo(() => [...Cat_columns, ...actionColum_cat], []);

    return (
        <div className="bg-green-600 min-h-screen flex justify-center items-center">
            <div className="w-full max-w-5xl flex justify-center items-center">
                <Paper sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                        rows={filtered_Category_Data}
                        columns={columns}
                        initialState={{ pagination: { paginationModel } }}
                        pageSizeOptions={[5, 10]}
                        checkboxSelection
                        sx={{ border: 0 }}
                    />
                </Paper>
            </div>
        </div>
    );
};

export default Ex_list;
