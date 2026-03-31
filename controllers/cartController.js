const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
    try {
        const guestId = req.query.guestId;
        const userId = req.user ? req.user.id : null;

        let cart;
        if (userId) {
            cart = await Cart.findOne({ user: userId }).populate('lineItems.productId');
        } else if (guestId) {
            cart = await Cart.findOne({ guestId }).populate('lineItems.productId');
        }

        if (!cart) {
            return res.json({ lineItems: [], subtotal: { amount: 0 } });
        }
        res.json(cart);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, guestId } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!userId && !guestId) {
            return res.status(400).json({ msg: "Identifier required to create a cart" });
        }

        let cart;
        if (userId) {
            cart = await Cart.findOne({ user: userId });
        } else {
            cart = await Cart.findOne({ guestId });
        }

        if (!cart) {
            cart = new Cart({ user: userId, guestId: userId ? null : guestId, lineItems: [] });
        }
        
        const itemIndex = cart.lineItems.findIndex(p => p.productId == productId);
        if (itemIndex > -1) {
            cart.lineItems[itemIndex].quantity += quantity;
        } else {
            cart.lineItems.push({ productId, quantity });
        }

        await cart.save();
        const populatedCart = await Cart.findById(cart._id).populate('lineItems.productId');
        res.json({ cart: populatedCart });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { itemId, guestId } = req.body; 
        const userId = req.user ? req.user.id : null;
        
        let cart;
        if (userId) {
            cart = await Cart.findOne({ user: userId });
        } else if (guestId) {
            cart = await Cart.findOne({ guestId });
        }

        if (cart) {
            cart.lineItems = cart.lineItems.filter(item => item.productId != itemId);
            await cart.save();
        }
        
        const populatedCart = cart ? await Cart.findById(cart._id).populate('lineItems.productId') : { lineItems: [], subtotal: { amount: 0 } };
        res.json({ cart: populatedCart });
    } catch (err) {
        res.status(500).send('Server error');
    }
}