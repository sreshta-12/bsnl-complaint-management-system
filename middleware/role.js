const { Complaint } = require('../models/complaint');

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash('error_msg', 'Please log in to continue.');
      return res.redirect('/users/login');
    }

    const userRole = req.user.role;
    console.log(`🔐 Role Check → ${req.user.email} | Role: ${userRole}`);

    if (!allowedRoles.includes(userRole)) {
      req.flash('error_msg', 'Access denied. You are not authorized.');
      return res.redirect('/'); // safer fallback than /dashboard
    }

    //  Preload staff complaints if role is staff
    if (userRole === 'staff') {
      try {
        const complaints = await Complaint.find({ forwardTo: req.user._id });
        req.staffComplaints = complaints;
      } catch (err) {
        console.error(' Error loading staff complaints:', err);
        req.staffComplaints = [];
      }
    }

    next();
  };
};

// ✅ Export middleware for role-specific use
const isAdmin = checkRole(['admin']);
const isStaff = checkRole(['staff']);
const isCustomer = checkRole(['customer']);

module.exports = {
  checkRole,
  isAdmin,
  isStaff,
  isCustomer
};
