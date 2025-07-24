const { Complaint } = require('../models/complaint');

/**
 * @route GET /feedback/view
 * @desc Admin: Show list of complaints that have feedback
 */
exports.viewFeedbackPage = async (req, res) => {
  try {
    const complaints = await Complaint.find({ 'feedback': { $exists: true, $ne: null } }).sort({ date: -1 });

    res.render('feedback/view', {
      complaints,
      complaint: null,
      errors: null
    });
  } catch (err) {
    console.error('❌ Error loading feedback view:', err);
    res.render('feedback/view', {
      complaints: [],
      complaint: null,
      errors: '⚠ Failed to load feedback.'
    });
  }
};

/**
 * @route POST /feedback/view
 * @desc Admin: Search feedback by Complaint ID
 */
exports.checkFeedback = async (req, res) => {
  try {
    const { complaintId } = req.body;
    const complaint = await Complaint.findById(complaintId.trim());

    if (!complaint || !complaint.feedback) {
      return res.render('feedback/view', {
        complaints: [],
        complaint: null,
        errors: '❌ No feedback found for the provided Complaint ID.'
      });
    }

    res.render('feedback/view', {
      complaints: [],
      complaint,
      errors: null
    });
  } catch (err) {
    console.error('❌ Error checking feedback:', err);
    res.render('feedback/view', {
      complaints: [],
      complaint: null,
      errors: '⚠ Invalid Complaint ID or server error.'
    });
  }
};

/**
 * @route POST /feedback/submit
 * @desc Customer: Submit feedback for resolved complaint
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { complaintId, rating, comments } = req.body;

    const complaint = await Complaint.findById(complaintId.trim());
    if (!complaint) {
      req.flash('error_msg', '❌ Complaint not found.');
      return res.redirect('/feedback/form'); // fallback to form
    }

    // Save feedback
    complaint.feedback = {
      rating,
      comments,
      submittedAt: new Date()
    };

    await complaint.save();

    req.flash('success_msg', '✅ Thank you for your valuable feedback!');
    res.redirect('/feedback/form'); // or redirect to /customer/history if it exists
  } catch (err) {
    console.error('❌ Error submitting feedback:', err);
    req.flash('error_msg', '⚠ Something went wrong. Please try again.');
    res.redirect('/feedback/form');
  }
};

/**
 * @route GET /feedback/:id
 * @desc Admin or Customer: View individual complaint feedback
 */
exports.viewComplaintFeedback = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id.trim());

    if (!complaint || !complaint.feedback) {
      req.flash('error_msg', '⚠ Feedback not found for this complaint.');
      return res.redirect('/feedback/form'); // safer fallback
    }

    res.render('feedback/single', { complaint });
  } catch (err) {
    console.error('❌ Error viewing individual feedback:', err);
    req.flash('error_msg', '⚠ Invalid Complaint ID.');
    res.redirect('/feedback/form');
  }
};
