const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const complaintSchema = new mongoose.Schema({
  searchBy: {
    type: String,
    enum: ['PhoneNo', 'AccountNo', 'TransactionID'],
    required: true
  },
  phoneNumber: {
    type: String,
    match: /^[0-9]{10}$/,
    required: function () { return this.searchBy === 'PhoneNo'; }
  },
  accountNumber: {
    type: String,
    required: function () { return this.searchBy === 'AccountNo'; }
  },
  transactionId: {
    type: String,
    required: function () { return this.searchBy === 'TransactionID'; }
  },
  transactionDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    min: 0,
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Landline/Bharat Fibre', 'Prepaid', 'GSM Postpaid','Wings', 'Corporate'],
    required: true
  },
  circle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    minlength: 10,
    maxlength: 5000,
    required: true
  },
  status: {
    type: String,
    enum: ['New', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
    default: 'New'
  },
  eta: String,
  adminNote: { type: String, maxlength: 1000 },
  staffNote: { type: String, maxlength: 1000 },
  forwardTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  feedback: {
    rating: {
      type: String,
      enum: ['1', '2', '3', '4', '5']
    },
    comments: {
      type: String,
      minlength: 3,
      maxlength: 5000
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }
}, { timestamps: true });

function validateComplaint(complaint) {
  const schema = Joi.object({
    searchBy: Joi.string().valid('PhoneNo', 'AccountNo', 'TransactionID').required(),
    phoneNumber: Joi.when('searchBy', {
      is: 'PhoneNo',
      then: Joi.string().pattern(/^[0-9]{10}$/).required(),
      otherwise: Joi.optional()
    }),
    accountNumber: Joi.when('searchBy', {
      is: 'AccountNo',
      then: Joi.string().required(),
      otherwise: Joi.optional()
    }),
    transactionId: Joi.when('searchBy', {
      is: 'TransactionID',
      then: Joi.string().required(),
      otherwise: Joi.optional()
    }),
    transactionDate: Joi.date().required(),
    amount: Joi.number().min(0).required(),
    serviceType: Joi.string().valid(
      'Broadband', 'Wings', 'Prepaid', 'Postpaid', 'Corporate', 'Landline', 'Bharat Fibre'
    ).required(),
    circle: Joi.string().required(),
    description: Joi.string().min(10).max(5000).required(),

  
    status: Joi.string().valid('New', 'Assigned', 'In Progress', 'Resolved', 'Closed'),
    eta: Joi.string().optional(),
    adminNote: Joi.string().max(1000).optional(),
    staffNote: Joi.string().max(1000).optional(),
    forwardTo: Joi.any().optional(),
    createdBy: Joi.any().optional(),
    feedback: Joi.any().optional(),
    date: Joi.date().optional()
  });

  return schema.validate(complaint);
}

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports.Complaint = Complaint;
module.exports.validateComplaint = validateComplaint;
