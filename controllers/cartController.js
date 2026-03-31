const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.json({ lineItems: [], subtotal: { amount: 0 } });
        }
        let cart = await Cart.findOne({ user: req.user.id }).populate('lineItems.productId');
        if (!cart) {
            cart = new Cart({ user: req.user.id, lineItems: [] });
            await cart.save();
        }
        res.json(cart);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.addToCart = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: "Please login to add to cart" });

        const { productId, quantity } = req.body;
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) cart = new Cart({ user: req.user.id, lineItems: [] });
        
        const itemIndex = cart.lineItems.findIndex(p => p.productId == productId);
        if (itemIndex > -1) {
            cart.lineItems[itemIndex].quantity += quantity;
        } else {
            cart.lineItems.push({ productId, quantity });
        }
        await cart.save();
        res.json({ cart });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: "Please login to remove from cart" });

        const { itemId } = req.body; 
        let cart = await Cart.findOne({ user: req.user.id });
        cart.lineItems = cart.lineItems.filter(item => item.productId != itemId);
        await cart.save();
        res.json({ cart });
    } catch (err) {
        res.status(500).send('Server error');
    }
}