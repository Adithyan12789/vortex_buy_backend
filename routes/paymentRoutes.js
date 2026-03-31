const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/payment/create-order', authMiddleware, paymentController.createOrder);
router.post('/payment/verify', authMiddleware, paymentController.verifyPayment);

module.exports = router;