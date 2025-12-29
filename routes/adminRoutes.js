const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Complaint = require('../models/complaint');
const { protect } = require('../middleware/authMiddleware');

// GET /api/admin/stats
router.get('/stats', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.countDocuments();
    const complaints = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    res.json({ users, complaints, resolved });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;