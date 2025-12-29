// civicfix-backend/models/complaint.js

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  location: { type: String },
  category: {
    type: String,
    enum: ['Water', 'Road', 'Electricity', 'Sanitation', 'Other'],
    default: 'Other',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  image: { type: String, default: '' },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ✅ required to track who created it
    required: true,
  },
  statusHistory: [
    {
      status: String,
      date: { type: Date, default: Date.now },
      changedBy: String,
      comment: String,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
