import express from 'express';
import { createExpense } from '../controllers/expense.controller.js';
import { getAllExpenses } from '../controllers/expense.controller.js';
import { updateExpense } from '../controllers/expense.controller.js';
import { deleteExpense } from '../controllers/expense.controller.js';

const router = express.Router();

// Expense routes
router.post("/", createExpense);
router.get("/", getAllExpenses);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;