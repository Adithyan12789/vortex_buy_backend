const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ username, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        
        console.log(`OTP for ${email} is: ${otp}`); // For debugging until true email integrated
        res.status(200).json({ msg: 'Registered successfully. Please verify OTP. (Check console)' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
        
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
        
        if (!user.isVerified) return res.status(400).json({ msg: 'Please verify your email via OTP first' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.profile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
};