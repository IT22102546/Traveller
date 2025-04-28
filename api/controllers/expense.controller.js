import Expense from "../models/expense.model.js";

export const createExpense = async (req, res) => {
    try {

        if (!req.body.label || !req.body.value || !req.body.date) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
     
        if (!req.body.currency) {
            req.body.currency = 'LKR';
        }

        const newExpense = await Expense.create(req.body);
        res.status(200).json(newExpense);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const getAllExpenses = async (req, res) => {
    try {
        const searchTerm = req.query.searchTerm || '';
        const query = searchTerm 
            ? { label: { $regex: searchTerm, $options: 'i' } } 
            : {};
            
        const expenses = await Expense.find(query).sort({ createdAt: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json(error);
    }
};