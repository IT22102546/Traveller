import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  createOrder,
  getOrder,
  updatePaymentStatus,
} from '../controllers/order.controller.js';
import multer from 'multer';

const upload = multer();

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.get('/:orderId', verifyToken, getOrder);
router.put(
    '/:orderId/payment', 
    verifyToken, 
    upload.single('paymentSlip'),
    updatePaymentStatus
  );
  


export default router;