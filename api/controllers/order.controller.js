import express from "express";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { storage } from "../config/firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export const createOrder = async (req, res, next) => {
  try {
    const { itinerary, date, numberOfMembers, members, totalAmount } = req.body;

    // Basic validation
    if (!itinerary || !date || !numberOfMembers || !members || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Calculate share for each member
    const share = totalAmount / numberOfMembers;

    const order = new Order({
      itinerary,
      date,
      numberOfMembers,
      members: members.map((member) => ({
        userId: member.userId,
        username: member.username,
        email: member.email,
        paymentStatus: "pending",
        paymentShare: share, // Assign each user their share
      })),
      totalAmount,
      createdBy: req.user.id,
    });

    const savedOrder = await order.save();

    // Populate some fields for the response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("itinerary", "title image location averageCost")
      .populate("createdBy", "username email");

    res.status(201).json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("itinerary")
      .populate("createdBy", "username email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
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
        message: "User ID is required",
        statusCode: 400,
      });
    }

    // Validate file type and size
    if (paymentSlip) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(paymentSlip.mimetype)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid file type. Only JPEG, PNG, and GIF images are allowed.",
          statusCode: 400,
        });
      }

      if (paymentSlip.size > 100 * 1024 * 1024) {
        // 100MB limit
        return res.status(400).json({
          success: false,
          message: "File size exceeds 100MB limit",
          statusCode: 400,
        });
      }
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        statusCode: 404,
      });
    }

    // Find the member
    const member = order.members.find(
      (m) => m.userId && m.userId.toString() === userId.toString()
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "User not found in order",
        statusCode: 404,
      });
    }

    // Handle file upload if payment slip exists
    let paymentSlipUrl = member.paymentSlip;
    if (paymentSlip) {
      try {
        // Generate a unique filename
        const timestamp = Date.now();
        const fileExtension = paymentSlip.mimetype.split("/")[1];
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
        console.error("File upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload payment slip",
          statusCode: 500,
          error: uploadError.message,
        });
      }
    }

    // Update payment status
    member.paymentStatus = "paid";
    member.paymentSlip = paymentSlipUrl;

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: updatedOrder,
      statusCode: 200,
      paymentSlipUrl: paymentSlipUrl,
    });
  } catch (error) {
    console.error("Error in updatePaymentStatus:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      statusCode: 500,
      error: error.message,
    });
  }
};

export const getUserPayments = async (req, res, next) => {
  try {
    const { userId } = req.params;
    //console.log(userId);
    // Fetch all orders where the user is part of the members
    const orders = await Order.find({ "members.userId": userId })
      .populate("itinerary", "title image location")
      .populate("createdBy", "username email");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    // For each order, find the user's payment info
    const userPayments = orders.map((order) => {
      const member = order.members.find(
        (m) => m.userId.toString() === userId.toString()
      );
      return {
        orderId: order._id,
        itinerary: order.itinerary,
        totalAmount: order.totalAmount,
        paymentStatus: member.paymentStatus,
        paymentShare: member.paymentShare,
        paymentSlip: member.paymentSlip,
        members: order.members,
      };
    });

    res.status(200).json({ userPayments });
  } catch (error) {
    next(error);
  }
};

export const getPendingOrdersWithPaidMembers = async (req, res, next) => {
  try {
    const orders = await Order.find({
      orderStatus: "pending", // Must be pending
      "members.paymentStatus": { $ne: "pending" }, // Ensure all members are paid
      $expr: {
        $eq: [
          {
            $size: {
              $filter: {
                input: "$members",
                as: "member",
                cond: { $ne: ["$$member.paymentStatus", "paid"] },
              },
            },
          },
          0,
        ],
      },
    })
      .populate("itinerary", "title image location")
      .populate("createdBy", "username email")
      .select("orderStatus members totalAmount createdBy date itinerary");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No matching orders found" });
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    next(error);
  }
};

export const markOrderAsPaid = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if all members have paid
    const allPaid = order.members.every(
      (member) => member.paymentStatus === "paid"
    );

    if (!allPaid) {
      return res.status(400).json({ message: "Not all members have paid." });
    }

    order.orderStatus = "completed";
    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: "Order marked as paid successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error in markOrderAsPaid:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getCompletedOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ orderStatus: "completed" })
      .populate("itinerary", "title image location")
      .populate("createdBy", "username email")
      .select("orderStatus members totalAmount createdBy date itinerary");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No completed orders found" });
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    next(error);
  }
};
