exports.homePage = (req, res) => {
  res.render('index'); 
};
exports.filterDashboard = (req, res) => {
  const role = req.user?.role;

  if (!role) {
    req.flash('error_msg', 'Unauthorized access.');
    return res.redirect('/users/login');
  }

  if (role === 'admin') {
    return res.redirect('/admin/dashboard');
  } else if (role === 'staff') {
    return res.redirect('/staff/dashboard');
  } else {
    return res.redirect('/complaints'); 
  }
};
