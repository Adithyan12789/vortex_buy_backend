const Razorpay = require('razorpay');
const Order = require('../models/Order');
const crypto = require('crypto');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

exports.createOrder = async (req, res) => {
    try {
        const { amount, lineItems, guestId } = req.body; // Amount should be passed from frontend
        const userId = req.user ? req.user.id : null;
        
        const options = {
            amount: Math.round(amount * 100), // format in smallest currency unit, rounded to avoid float issues
            currency: "INR",
            receipt: "receipt_order_" + Date.now()
        };
        
        const order = await instance.orders.create(options);
        
        const newOrderObj = new Order({
            user: userId,
            guestId: userId ? null : guestId,
            lineItems: lineItems,
            totalAmount: amount,
            razorpayOrderId: order.id
        });
        await newOrderObj.save();
        
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
                                        .update(body.toString())
                                        .digest('hex');
                                        
        if (expectedSignature === razorpay_signature) {
            await Order.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { 
                paymentStatus: 'Paid',
                razorpayPaymentId: razorpay_payment_id
            });
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getOrders = async (req, res) => {
    try {
        const guestId = req.query.guestId;
        const userId = req.user ? req.user.id : null;
        
        let query = {};
        if (userId) {
            query.user = userId;
        } else if (guestId) {
            query.guestId = guestId;
        } else {
            return res.json([]);
        }

        const orders = await Order.find(query).populate('lineItems.productId').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).send(error);
    }
};