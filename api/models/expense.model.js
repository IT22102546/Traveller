import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    label: { 
        type: String, 
        required: true 
    },
    value: { 
        type: Number, 
        required: true 
    },
    date: { 
        type: String, 
        required: true 
    },
    currency: {
        type: String,
        required: true,
        default: 'LKR'
    },
    note: {
        type: String,
        required: false
    }
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;