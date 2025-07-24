const { Complaint, validateComplaint } = require('../models/complaint');
const { User } = require('../models/user');

exports.addComplaint = async (req, res) => {
  try {
    const {
      searchBy,
      searchValue,
      transactionDate,
      amount,
      serviceType,
      circle,
      description
    } = req.body;

    const normalizedCircle = circle.trim().toLowerCase();
    const normalizedServiceType = serviceType.trim().toLowerCase();

    const complaintData = {
      searchBy,
      transactionDate,
      amount,
      serviceType: serviceType.trim(),
      circle: circle.trim(),
      description,
      createdBy: req.user._id,
      date: new Date(),
      status: 'New'
    };

    if (searchBy === 'PhoneNo') {
      complaintData.phoneNumber = searchValue;
    } else if (searchBy === 'AccountNo') {
      complaintData.accountNumber = searchValue;
    } else if (searchBy === 'TransactionID') {
      complaintData.transactionId = searchValue;
    }

    const { error } = validateComplaint(complaintData);
    if (error) {
      req.flash('error_msg', error.details[0].message);
      return res.redirect('/complaints/add');
    }

    const staff = await User.findOne({
      role: 'staff',
      circle: { $regex: normalizedCircle, $options: 'i' },
      department: { $regex: normalizedServiceType, $options: 'i' }
    });

    if (staff) {
      complaintData.forwardTo = staff._id;
      complaintData.assignedStaffName = staff.name;
      complaintData.status = 'In Progress';

      console.log(`✅ Auto-assigned to: ${staff.name} (${staff.email})`);
    } else {
      console.warn(`❌ No staff found for circle "${circle}" and department "${serviceType}"`);
    }

    const complaint = new Complaint(complaintData);
    await complaint.save();

    req.flash(
      'success_msg',
      `✅ Complaint submitted successfully! Reference ID: ${complaint._id}`
    );
    return res.redirect('/complaints/add');

  } catch (err) {
    console.error('❌ Error submitting complaint:', err.message);
    req.flash('error_msg', '❌ Something went wrong while submitting the complaint.');
    return res.redirect('/complaints/add');
  }
};
