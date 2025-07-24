const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha');
const bcrypt = require('bcryptjs');
const Joi = require('@hapi/joi');
const { User } = require('../models/user');
const {
  checkAuthenticated,
  checkNotAuthenticated
} = require('../middleware/auth');
const UserController = require('../controllers/UserController');

// ========== CAPTCHA ROUTE ==========
router.get('/captcha', (req, res) => {
  const captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;
  res.type('svg');
  res.status(200).send(captcha.data);
});

// ========== VALIDATION ==========
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    captcha: Joi.string().required()
  });
  return schema.validate(data);
};

// ========== LOGIN ROUTES ==========
router.get('/login', checkNotAuthenticated, UserController.loginPage);

router.post('/login', checkNotAuthenticated, async (req, res) => {
  const { error } = validateLogin(req.body);
  const { email, password, captcha } = req.body;

  if (error) {
    req.flash('error_msg', '⚠ All fields are required.');
    return res.redirect('/users/login');
  }

  if (captcha !== req.session.captcha) {
    req.flash('error_msg', '⚠ Invalid captcha.');
    return res.redirect('/users/login');
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', '❌ User not found. Please register.');
      return res.redirect('/users/login');
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      req.flash('error_msg', '❌ Incorrect password.');
      return res.redirect('/users/login');
    }

    req.session.user = user;

    req.login(user, (err) => {
      if (err) {
        req.flash('error_msg', '⚠ Login error.');
        return res.redirect('/users/login');
      }

      // ✅ Role-Based Redirection
      if (user.role === 'admin') return res.redirect('/admin/dashboard');
      if (user.role === 'staff') return res.redirect('/staff/dashboard');
      return res.redirect('/complaints'); // for customers
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', '⚠ Login failed.');
    res.redirect('/users/login');
  }
});

// ========== SIGNUP ROUTES ==========
router.get('/signup', checkNotAuthenticated, (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', async (req, res) => {
  const { name, email, mobile, password, confirmPassword, captcha } = req.body;

  if (!name || !email || !mobile || !password || !confirmPassword || !captcha) {
    req.flash('error_msg', '⚠ Please fill all fields.');
    return res.redirect('/users/signup');
  }

  if (password !== confirmPassword) {
    req.flash('error_msg', '⚠ Passwords do not match.');
    return res.redirect('/users/signup');
  }

  if (captcha !== req.session.captcha) {
    req.flash('error_msg', '⚠ Invalid captcha.');
    return res.redirect('/users/signup');
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      req.flash('error_msg', '⚠ Email or mobile already exists.');
      return res.redirect('/users/signup');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.pendingUser = {
      name,
      email,
      mobile,
      password,
      otp
    };

    console.log(`📱 OTP for ${mobile}: ${otp}`); // Simulated SMS
    res.render('auth/verify-otp', { mobile });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', '⚠ OTP generation failed.');
    res.redirect('/users/signup');
  }
});

router.post('/verify-otp', async (req, res) => {
  const { otp } = req.body;

  if (!req.session.pendingUser) {
    req.flash('error_msg', 'Session expired. Try again.');
    return res.redirect('/users/signup');
  }

  if (otp !== req.session.pendingUser.otp) {
    req.flash('error_msg', '⚠ Invalid OTP.');
    return res.render('auth/verify-otp', {
      mobile: req.session.pendingUser.mobile
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(req.session.pendingUser.password, 10);
    const user = new User({
      name: req.session.pendingUser.name,
      email: req.session.pendingUser.email,
      mobile: req.session.pendingUser.mobile,
      password: hashedPassword,
      role: 'customer'
    });

    await user.save();
    req.session.pendingUser = null;
    req.flash('success_msg', '✅ Account created successfully. Please login.');
    res.redirect('/users/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', '⚠ Registration failed.');
    res.redirect('/users/signup');
  }
});

// ========== RESET PASSWORD PAGE ==========
router.get('/reset-password', (req, res) => {
  res.render('auth/reset');
});

// ========== LOGOUT ==========
router.get('/logout', checkAuthenticated, UserController.logOutUser);

// ========== TEMP ADMIN/STAFF CREATOR ==========
router.get('/create-admin', async (req, res) => {
  if (req.query.key !== 'bsnl2025') {
    return res.status(403).send('Unauthorized access');
  }

  try {
    const usersToCreate = [
      {
        name: 'BSNL Admin',
        email: 'admin1@bsnl.in',
        mobile: '9999999999',
        password: 'admin123',
        department: 'Management',
        role: 'admin'
      },
      {
        name: 'BSNL Staff',
        email: 'staff@bsnl.in',
        mobile: '8888888888',
        password: 'staff123',
        department: 'Technical',
        role: 'staff'
      }
    ];

    for (const userData of usersToCreate) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        const hashedPwd = await bcrypt.hash(userData.password, 10);
        const newUser = new User({ ...userData, password: hashedPwd });
        await newUser.save();
      }
    }

    res.send('✅ Admin and staff created successfully!');
  } catch (err) {
    console.error('❌ Error creating users:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
