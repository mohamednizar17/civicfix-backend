const Complaint = require('../models/complaint');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');

// ✅ Create a complaint
const createComplaint = async (req, res) => {
  const { title, description, location, category, image } = req.body;

  try {
    const complaint = await Complaint.create({
      title,
      description,
      location,
      category,
      image,
      user: req.user._id,
      status: 'Pending',
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error('❌ Complaint creation error:', error.message);
    res.status(500).json({ message: 'Failed to create complaint' });
  }
};

// ✅ Get all complaints (admin only)
const getAllComplaints = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const complaints = await Complaint.find().populate('user', 'name email');
    res.json(complaints);
  } catch (error) {
    console.error('❌ Fetch all complaints error:', error.message);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
};

// ✅ Get logged-in user's complaints
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id });
    res.json(complaints);
  } catch (error) {
    console.error('❌ Fetch my complaints error:', error.message);
    res.status(500).json({ message: 'Failed to fetch your complaints' });
  }
};

// ✅ Update complaint status (admin only) + send email
const updateComplaintStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, comment } = req.body;
    const complaintId = req.params.id;

    // Fetch complaint without validation to handle legacy data
    const complaint = await Complaint.findById(complaintId).lean();
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // ✅ If complaint has no user, assign current admin (fixes legacy data)
    if (!complaint.user) {
      console.warn(`⚠️ Complaint ${complaintId} has no user assigned, assigning to admin`);
      complaint.user = req.user._id;
    }

    // Update using findByIdAndUpdate to preserve user field
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        status: status || complaint.status,
        $push: {
          statusHistory: {
            status: status || complaint.status,
            date: new Date(),
            changedBy: req.user.name || req.user.email,
            comment: comment || '',
          }
        },
        // Ensure user field is preserved
        user: complaint.user,
      },
      { new: true, runValidators: false } // Skip validation to avoid issues
    ).populate('user', 'name email');

    // ✅ Send email notification to the user
    let emailSent = false;
    if (updatedComplaint.user && updatedComplaint.user.email) {
      console.log(`📧 Attempting to send email to ${updatedComplaint.user.email}`);
      emailSent = await sendEmail({
        to: updatedComplaint.user.email,
        subject: 'Your Complaint Status Has Changed',
        text: `Hello ${updatedComplaint.user.name},\n\nThe status of your complaint "${updatedComplaint.title}" is now "${updatedComplaint.status}".\n\nAdmin Comment: ${comment || 'No comment.'}`,
        html: `<p>Hello ${updatedComplaint.user.name},</p>
               <p>The status of your complaint "<b>${updatedComplaint.title}</b>" is now <b>${updatedComplaint.status}</b>.</p>
               <p><b>Admin Comment:</b> ${comment || 'No comment.'}</p>`,
      });
      
      if (emailSent) {
        console.log(`✅ Email sent successfully to ${updatedComplaint.user.email}`);
      } else {
        console.warn(`⚠️ Email failed to send to ${updatedComplaint.user.email}, but status was updated`);
      }
    } else {
      console.warn('⚠️ No user email found for complaint');
    }

    res.json({ 
      message: 'Status updated and comment added.',
      emailSent: emailSent
    });
  } catch (error) {
    console.error('❌ Status update error:', error.message);
    res.status(500).json({ message: 'Failed to update complaint status', error: error.message });
  }
};

// ✅ Delete complaint (admin or owner)
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const isOwner = complaint.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete' });
    }

    await complaint.deleteOne();
    res.json({ message: 'Complaint deleted' });
  } catch (error) {
    console.error('❌ Delete complaint error:', error.message);
    res.status(500).json({ message: 'Failed to delete complaint' });
  }
};

// ✅ Get complaint trends for the past 7 days
const getComplaintTrends = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const trends = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fill missing days with 0
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const found = trends.find((t) => t._id === dateStr);
      result.push({ date: dateStr, count: found ? found.count : 0 });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get complaint trends' });
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintTrends
};
