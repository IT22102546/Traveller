import express from 'express';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import { storage } from '../config/firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';


export const createOrder = async (req, res, next) => {
    try {
      const { itinerary, date, numberOfMembers, members, totalAmount } = req.body;
  
      // Basic validation
      if (!itinerary || !date || !numberOfMembers || !members || !totalAmount) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      const order = new Order({
        itinerary,
        date,
        numberOfMembers,
        members: members.map(member => ({
          userId: member.userId,
          username: member.username,
          email: member.email,
          paymentStatus: 'pending'
        })),
        totalAmount,
        createdBy: req.user.id
      });
  
      const savedOrder = await order.save();
      
      // Populate some fields for the response
      const populatedOrder = await Order.findById(savedOrder._id)
        .populate('itinerary', 'title image location averageCost')
        .populate('createdBy', 'username email');
  
      res.status(201).json(populatedOrder);
    } catch (error) {
      next(error);
    }
  };

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('itinerary')
      .populate('createdBy', 'username email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const { userId } = req.body;
      const paymentSlip = req.file;
  
      // Validate inputs
      if (!userId) {
        return res.status(400).json({ 
          success: false,
          message: 'User ID is required',
          statusCode: 400
        });
      }
  
      // Validate file type and size
      if (paymentSlip) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(paymentSlip.mimetype)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only JPEG, PNG, and GIF images are allowed.',
            statusCode: 400
          });
        }
  
        if (paymentSlip.size > 100 * 1024 * 1024) { // 100MB limit
          return res.status(400).json({
            success: false,
            message: 'File size exceeds 100MB limit',
            statusCode: 400
          });
        }
      }
  
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ 
          success: false,
          message: 'Order not found',
          statusCode: 404
        });
      }
  
      // Find the member
      const member = order.members.find(m => 
        m.userId && m.userId.toString() === userId.toString()
      );
  
      if (!member) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found in order',
          statusCode: 404
        });
      }
  
      // Handle file upload if payment slip exists
      let paymentSlipUrl = member.paymentSlip;
      if (paymentSlip) {
        try {
          // Generate a unique filename
          const timestamp = Date.now();
          const fileExtension = paymentSlip.mimetype.split('/')[1];
          const fileName = `payment-slips/${timestamp}-${userId}.${fileExtension}`;
          
          // Create a reference to the file
          const storageRef = ref(storage, fileName);
          
          // Define metadata with the correct content type
          const metadata = {
            contentType: paymentSlip.mimetype,
          };
  
          // Upload file to Firebase Storage
          const snapshot = await uploadBytesResumable(
            storageRef, 
            paymentSlip.buffer, 
            metadata
          );
          
          // Get download URL
          paymentSlipUrl = await getDownloadURL(snapshot.ref);
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload payment slip',
            statusCode: 500,
            error: uploadError.message
          });
        }
      }
  
      // Update payment status
      member.paymentStatus = 'paid';
      member.paymentSlip = paymentSlipUrl;
  
      const updatedOrder = await order.save();
      
      res.status(200).json({
        success: true,
        message: 'Payment status updated successfully',
        data: updatedOrder,
        statusCode: 200,
        paymentSlipUrl: paymentSlipUrl
      });
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        statusCode: 500,
        error: error.message
      });
    }
  };
