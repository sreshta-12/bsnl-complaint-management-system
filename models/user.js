const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

// Schema Definition
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  department: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'customer', 'technician'], 
    required: true
  },
  circle: {
    type: String,
    required: function () {
      return this.role === 'staff' || this.role === 'technician'; 
    }
  },
  currentLoad: {
    type: Number,
    default: 0 
  }
});

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().email().required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
    password: Joi.string().min(5).max(255).required(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match'
    }),
    department: Joi.string().allow('', null),
    role: Joi.string().valid('admin', 'staff', 'customer', 'technician').required(),
    circle: Joi.when('role', {
      is: Joi.valid('staff', 'technician'), 
      then: Joi.string().required(),
      otherwise: Joi.optional()
    })
  });

  return schema.validate(user);
}

module.exports = {
  User,
  validateUser
};
