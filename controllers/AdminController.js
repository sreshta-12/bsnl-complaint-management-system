const { User } = require('../models/user');
const { Complaint } = require('../models/complaint');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

// Admin Dashboard with Stats
exports.adminDashboard = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('forwardTo');
    const staff = await User.find({ role: 'staff' });

    // Aggregate Circle-Wise (State)
    const circles = await Complaint.aggregate([
      { $group: { _id: "$state", count: { $sum: 1 } } }
    ]);

    // Clean unknown/null/empty state values
    const cleanedCircles = (circles || []).filter(c =>
      c._id && c._id.trim().toLowerCase() !== 'unknown'
    );

    const statuses = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const techAssignments = await Complaint.aggregate([
      { $match: { forwardTo: { $ne: null } } },
      { $group: { _id: "$forwardTo", count: { $sum: 1 } } }
    ]);

    const techs = await Promise.all(
      techAssignments.map(async (t) => {
        const user = await User.findById(t._id);
        return {
          name: user ? user.name : 'Unknown',
          count: t.count
        };
      })
    );

    res.render('admin/dashboard', {
      admin: req.user,
      complaints,
      staff,
      stats: {
        circles: cleanedCircles,
        statuses: statuses || [],
        techs: techs || []
      }
    });
  } catch (err) {
    console.error('Admin Dashboard Error:', err);
    req.flash('error_msg', 'Failed to load admin dashboard.');
    res.redirect('/');
  }
};

// Complaints Page (Assign & Manage)
exports.adminComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('forwardTo');
    const staff = await User.find({ role: 'staff' });
    res.render('admin/complaints', { complaints, staff, admin: req.user });
  } catch (err) {
    console.error('Complaint Load Error:', err);
    req.flash('error_msg', 'Could not load complaints.');
    res.redirect('/admin/dashboard');
  }
};

// Display Admin & Staff Users
exports.displayUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['admin', 'staff'] } });
    res.render('admin/displayuser', {
      users,
      admin: req.user
    });
  } catch (err) {
    console.error('Display Users Error:', err);
    req.flash('error_msg', 'Error loading users.');
    res.redirect('/admin/dashboard');
  }
};

// Register New Admin/Staff
exports.registerUser = async (req, res) => {
  try {
    let { name, email, password, role, department, mobile, circle } = req.body;
    email = email.trim().toLowerCase();

    const existing = await User.findOne({ email });
    if (existing) throw new Error('Email already exists.');

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashed,
      role,
      department,
      mobile,
      circle
    });

    await newUser.save();
    req.flash('success_msg', `${role.charAt(0).toUpperCase() + role.slice(1)} account created.`);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('🚫 Registration Error:', err.message);
    req.flash('error_msg', err.message || 'Error creating account.');
    res.redirect('/admin/dashboard');
  }
};

// Forward Complaint to Selected Staff
exports.forwardComplaints = async (req, res) => {
  try {
    const { complaintId, staffId } = req.body;

    await Complaint.findByIdAndUpdate(complaintId, {
      forwardTo: new mongoose.Types.ObjectId(staffId),
      status: 'In Progress'
    });

    req.flash('success_msg', 'Complaint forwarded to staff.');
  } catch (err) {
    console.error('Forwarding Error:', err);
    req.flash('error_msg', 'Failed to forward complaint.');
  }
  res.redirect('/admin/complaints');
};

// Update Complaint Status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId, status } = req.body;
    await Complaint.findByIdAndUpdate(complaintId, { status });
    req.flash('success_msg', 'Complaint status updated.');
  } catch (err) {
    console.error('Status Update Error:', err);
    req.flash('error_msg', 'Failed to update status.');
  }
  res.redirect('/admin/complaints');
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success_msg', '🗑️ User deleted.');
  } catch (err) {
    console.error('Delete User Error:', err);
    req.flash('error_msg', 'Could not delete user.');
  }
  res.redirect('/admin/users/display');
};

// Export Complaints to CSV
exports.exportCSV = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('forwardTo');

    const fields = [
      '_id',
      'searchBy',
      'phoneNumber',
      'accountNumber',
      'transactionId',
      'transactionDate',
      'amount',
      'serviceType',
      'description',
      'status',
      'adminNote',
      'staffNote',
      'date',
      'feedback'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(complaints);

    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

    const filePath = path.join(exportDir, 'complaints.csv');
    fs.writeFileSync(filePath, csv);
    res.download(filePath);
  } catch (err) {
    console.error('CSV Export Error:', err);
    req.flash('error_msg', 'Could not export complaints.');
    res.redirect('/admin/dashboard');
  }
};
