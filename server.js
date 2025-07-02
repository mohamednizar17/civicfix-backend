// civicfix-backend/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ✅ Increase payload limit to avoid PayloadTooLargeError
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
  origin: 'https://civicfix-frontend-pearl.vercel.app', // replace with your actual frontend URL
  credentials: true,
}));

// ✅ Routes
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('🌐 CivicFix Backend is running...');
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Internal error:', err.stack);
  res.status(500).json({ message: 'Server error' });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
