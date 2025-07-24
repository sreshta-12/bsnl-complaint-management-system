const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha');

router.get('/', (req, res) => {
  const captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;
  res.type('svg');
  res.status(200).send(captcha.data);
});

module.exports = router;
