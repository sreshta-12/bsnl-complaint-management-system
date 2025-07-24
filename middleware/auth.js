// ✅ Check if user is logged in
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // Set session role for frontend use (optional)
    req.session.role = req.user.role;

    return next();
  }

  // If not logged in
  req.flash('error_msg', "You're not authorized to view this resource");
  res.redirect('/users/login');
}

// ✅ Prevent logged-in users from accessing login/register
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // Redirect based on role
    const role = req.user.role;
    req.session.role = role;

    if (role === 'admin') return res.redirect('/admin/dashboard');
    if (role === 'staff') return res.redirect('/staff/dashboard');
    if (role === 'customer') return res.redirect('/customer/dashboard');
  }

  // If not authenticated, allow access
  next();
}

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated
};
