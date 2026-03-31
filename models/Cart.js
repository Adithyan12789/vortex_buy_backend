const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lineItems: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 }
    }],
    subtotal: { amount: { type: Number, default: 0 } }
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);