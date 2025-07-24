const passport = require('passport');

/**
 * @route 
 * @description 
 */
exports.loginPage = (req, res) => {
  try {
    res.render('users/login'); 
  } catch (error) {
    console.error('Failed to render login page:', error);
    res.send('Error loading login page');
  }
};

/**
 * @route
 * @description 
 */
exports.logOutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success_msg', 'Successfully logged out');
    res.redirect('/users/login');
  });
};
