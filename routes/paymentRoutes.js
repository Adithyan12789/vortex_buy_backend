const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
router.post('/payment/create-order', paymentController.createOrder);
router.post('/payment/verify', paymentController.verifyPayment);

module.exports = router;