
// File: routes/feedback.js

const express = require('express');
const router = express.Router();

const { checkAuthenticated } = require('../middleware/auth');
const FeedbackController = require('../controllers/FeedbackController');
router.use((req, res, next) => {
  console.log(` ${req.method} ${req.originalUrl}`);
  next();
});
router.get('/form', checkAuthenticated, (req, res) => {
  res.render('feedback/form'); 
});
router.post('/submit', checkAuthenticated, FeedbackController.submitFeedback);
router.get('/view', checkAuthenticated, (req, res) => {
  if (req.user.role === 'admin' || req.user.role === 'staff') {
    return FeedbackController.viewFeedbackPage(req, res);
  }
  req.flash('error_msg', 'Access denied: Only authorized personnel can access this page.');
  res.redirect('/');
});
router.post('/view', checkAuthenticated, (req, res) => {
  if (req.user.role === 'admin' || req.user.role === 'staff') {
    return FeedbackController.checkFeedback(req, res);
  }
  req.flash('error_msg', 'Access denied: Only authorized personnel can access this page.');
  res.redirect('/');
});
router.get('/:id', checkAuthenticated, FeedbackController.viewComplaintFeedback);

module.exports = router;
