const express = require('express');
const router = express.Router();
const session = require('express-session');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');

router.get('/signin', (req, res) => {
  const captcha = Math.floor(100000 + Math.random() * 900000).toString(); 
  req.session.captcha = captcha;
  res.render('auth/signin', { captcha, error: null });
});

router.post('/signin', [
  body('username').notEmpty(),
  body('password').notEmpty(),
  body('captcha').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  const { username, password, captcha } = req.body;

  if (!errors.isEmpty()) {
    return res.render('auth/signin', {
      captcha: req.session.captcha,
      error: 'All fields are required.'
    });
  }

  if (captcha !== req.session.captcha) {
    return res.render('auth/signin', {
      captcha: req.session.captcha,
      error: 'Incorrect Captcha.'
    });
  }

  try {
    const user = await User.findOne({ email: username });


    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('auth/signin', {
        captcha: req.session.captcha,
        error: 'Invalid credentials.'
      });
    }

    req.session.user = user;
    req.session.role = user.role;

    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else if (user.role === 'staff') {
      return res.redirect('/staff/dashboard');
    } else {
      return res.redirect('/user/home'); 
    }
  } catch (err) {
    console.error('Login Error:', err);
    res.render('auth/signin', {
      captcha: req.session.captcha,
      error: 'Something went wrong. Try again.'
    });
  }
});

// GET: Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout Error:', err);
    res.redirect('/signin');
  });
});

module.exports = router;
