// civicfix-backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  name: process.env.ADMIN_NAME,
  role: 'admin',
};

// ✅ Register route
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role: role || 'user' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ✅ Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if admin
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const token = jwt.sign({ id: 'admin-id', role: ADMIN_CREDENTIALS.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, user: ADMIN_CREDENTIALS });
  }

  // Normal user
  const user = await User.findOne({ email });
  if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
