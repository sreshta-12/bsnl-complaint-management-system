const { Complaint } = require('../models/complaint');
const mongoose = require('mongoose');

exports.staffDashboard = async (req, res) => {
  try {
    const complaints = await Complaint.find({ forwardTo: req.user._id }).sort({ createdAt: -1 });
    res.render('staff/dashboard', {
      staff: req.user,
      complaints
    });
  } catch (err) {
    console.error('Error loading staff dashboard:', err);
    req.flash('error_msg', 'Could not load dashboard.');
    res.redirect('/');
  }
};

exports.viewComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ forwardTo: req.user._id }).sort({ createdAt: -1 });
    res.render('staff/complaints', {
      staff: req.user,
      complaints
    });
  } catch (err) {
    console.error('Error loading complaints list:', err);
    req.flash('error_msg', 'Could not load assigned complaints.');
    res.redirect('/staff/dashboard');
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId, status, feedback } = req.body;

    const complaint = await Complaint.findOne({
      _id: complaintId,
      forwardTo: new mongoose.Types.ObjectId(req.user._id)
    });

    if (!complaint) {
      req.flash('error_msg', 'Complaint not found or not assigned to you.');
      return res.redirect('/staff/dashboard');
    }

    complaint.status = status
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    complaint.staffNote = feedback;

    if (status.toLowerCase() === 'resolved' && !complaint.feedback) {
      complaint.feedback = {
        rating: '5',
        comments: 'Resolved by BSNL Staff.',
        submittedAt: new Date()
      };
    }

    await complaint.save();

    req.flash('success_msg', 'Complaint updated successfully.');
    res.redirect('/staff/dashboard');
  } catch (err) {
    console.error('Error updating complaint status:', err);
    req.flash('error_msg', 'Failed to update complaint.');
    res.redirect('/staff/dashboard');
  }
};
