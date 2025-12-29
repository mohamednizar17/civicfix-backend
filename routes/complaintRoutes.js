// civicfix-backend/routes/complaintRoutes.js

const express = require('express');
const router = express.Router();

const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintTrends

} = require('../controllers/complaintControllers');

const { protect } = require('../middleware/authMiddleware');

// ✅ Create a new complaint (any logged-in user)
router.post('/', protect, createComplaint);

// ✅ Get all complaints (admin only)
router.get('/', protect, getAllComplaints);

// ✅ Get logged-in user's own complaints
router.get('/my', protect, getMyComplaints);

// ✅ Update status of a complaint (admin only)
router.patch('/:id', protect, updateComplaintStatus);

// ✅ Delete a complaint (admin or owner)
router.delete('/:id', protect, deleteComplaint);

// ✅ Get complaint trends (admin only)
router.get('/trends', protect, getComplaintTrends);

module.exports = router;
