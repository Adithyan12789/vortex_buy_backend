const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestId: String,
    lineItems: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number
    }],
    totalAmount: Number,
    paymentMethod: { type: String, default: 'Razorpay' },
    shippingInfo: {
        name: String,
        email: String,
        address: String
    },
    paymentStatus: { type: String, default: 'Pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);