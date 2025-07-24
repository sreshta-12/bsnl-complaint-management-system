const express = require('express');
const router = express.Router();

const { checkAuthenticated } = require('../middleware/auth');
const { isStaff } = require('../middleware/role');
const StaffController = require('../controllers/StaffController');

//  Staff Dashboard - summary
router.get(
  '/dashboard',
  checkAuthenticated,
  isStaff,
  StaffController.staffDashboard
);

//  View complaints assigned to staff
router.get(
  '/complaints',
  checkAuthenticated,
  isStaff,
  StaffController.viewComplaints
);

//  Update assigned complaint 
router.post(
  '/complaints/update-status',
  checkAuthenticated,
  isStaff,
  StaffController.updateComplaintStatus
);

module.exports = router;
