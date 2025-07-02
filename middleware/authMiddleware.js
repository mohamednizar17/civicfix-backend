// civicfix-backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Received token:', token); // Debug log

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Skip DB lookup for hardcoded admin
      if (decoded.id === 'admin-id') {
        req.user = {
          _id: 'admin-id',
          name: 'Admin',
          email: 'admin@civicfix.com',
          role: 'admin',
        };
        return next();
      }

      // ✅ For regular users
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } else {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return res.status(401).json({ message: 'Token verification failed' });
  }
};

module.exports = { protect };
