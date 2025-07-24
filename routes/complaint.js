const express = require('express');
const router = express.Router();
const { checkAuthenticated } = require('../middleware/auth');
const { Complaint } = require('../models/complaint');
const ComplaintController = require('../controllers/ComplaintController');
const FeedbackController = require('../controllers/FeedbackController');

router.get('/', checkAuthenticated, (req, res) => {
  res.redirect('/complaints/add');
});

router.get('/add', checkAuthenticated, (req, res) => {
  res.render('complaints/add');
});

router.post('/add', checkAuthenticated, ComplaintController.addComplaint);
router.post('/', checkAuthenticated, ComplaintController.addComplaint);

router.get('/status', (req, res) => {
  res.render('pages/complaint-status', {
    complaint: null,
    status: null,
    notFound: false
  });
});

router.post('/status', async (req, res) => {
  const { complaintId } = req.body;

  try {
    const complaint = await Complaint.findById(complaintId.trim());
    if (!complaint) {
      return res.render('pages/complaint-status', {
        complaint: null,
        status: null,
        notFound: true
      });
    }

    res.render('pages/complaint-status', {
      complaint,
      status: complaint.status,
      notFound: false
    });
  } catch (err) {
    console.error(' Error fetching complaint:', err);
    res.render('pages/complaint-status', {
      complaint: null,
      status: null,
      notFound: true
    });
  }
});

// Feedback form for resolved complaints
router.get('/feedback/:id', checkAuthenticated, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint || complaint.status !== 'done') {
      req.flash('error_msg', '⚠ Feedback can only be submitted for resolved complaints.');
      return res.redirect('/complaints/status');
    }

    res.render('feedback/submit', { complaint });
  } catch (err) {
    console.error(' Error loading feedback form:', err);
    req.flash('error_msg', 'Unable to load feedback form.');
    res.redirect('/complaints/status');
  }
});

// Handle feedback submission
router.post('/feedback/submit', checkAuthenticated, FeedbackController.submitFeedback);

module.exports = router;
