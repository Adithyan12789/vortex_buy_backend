const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        // Optional path for guest endpoints
        req.user = null;
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        // Still proceed, just unauthenticated
        req.user = null;
        next();
    }
};