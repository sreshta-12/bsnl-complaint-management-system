const express = require('express');
const router = express.Router();

const { checkAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const AdminController = require('../controllers/AdminController');
const { Complaint } = require('../models/complaint');
const { User } = require('../models/user');

// Dashboard
router.get('/dashboard', checkAuthenticated, isAdmin, AdminController.adminDashboard);

// Register Admin or Staff
router.post('/users/register', checkAuthenticated, isAdmin, AdminController.registerUser);

// Filtered Complaints by Circle
router.get('/complaints', checkAuthenticated, isAdmin, async (req, res) => {
  const { circle } = req.query;
  const query = circle ? { circle } : {};

  const complaints = await Complaint.find(query).populate('createdBy').sort({ createdAt: -1 });
  const staff = await User.find({ role: 'staff' });

  res.render('admin/complaints', {
    complaints,
    admin: req.user,
    staff
  });
});

// Forward Complaint to Staff
router.post('/complaints/forward', checkAuthenticated, isAdmin, AdminController.forwardComplaints);

// Update Complaint Status
router.post('/complaints/update-status', checkAuthenticated, isAdmin, AdminController.updateComplaintStatus);

// View All Admin and Staff Users
router.get('/users/display', checkAuthenticated, isAdmin, AdminController.displayUsers);

// Delete User
router.post('/users/delete/:id', checkAuthenticated, isAdmin, AdminController.deleteUser);

// Export Complaints to CSV
router.get('/export', checkAuthenticated, isAdmin, AdminController.exportCSV);

module.exports = router;
