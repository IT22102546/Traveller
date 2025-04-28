import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    itinerary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Itinerary',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    numberOfMembers: {
      type: Number,
      required: true,
      min: 1,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        username: String,
        email: String,
        paymentStatus: {
          type: String,
          enum: ['pending', 'paid'],
          default: 'pending',
        },
        paymentSlip: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'partial', 'completed'],
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);



const Order = mongoose.model('Order', orderSchema);

export default Order;