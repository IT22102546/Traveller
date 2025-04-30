import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createOrder,
  deleteOrder,
  getCompletedOrders,
  getOrder,
  getPendingOrdersWithPaidMembers,
  getUserPayments,
  markOrderAsPaid,
  updatePaymentStatus,
} from "../controllers/order.controller.js";
import multer from "multer";

const upload = multer();

const router = express.Router();

router.post("/", verifyToken, createOrder);
router.get("/:orderId", verifyToken, getOrder);
router.put(
  "/:orderId/payment",
  verifyToken,
  upload.single("paymentSlip"),
  updatePaymentStatus
);

// this route for track the individuals payment status
router.get("/:userId/my-payments", getUserPayments);

// get all the order pendings with paid members
router.get(
  "/orders/pending-with-paid-members",
  verifyToken,
  getPendingOrdersWithPaidMembers
);

//mark as paid by admin routes
router.put("/:orderId/mark-as-paid", verifyToken, markOrderAsPaid);
//get completed orders
router.get("/orders/completed", verifyToken, getCompletedOrders);
//deete order
router.delete("/:orderId", verifyToken, deleteOrder);

export default router;
