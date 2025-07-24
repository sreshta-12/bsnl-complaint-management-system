if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); 
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const compression = require('compression');
const expressLayouts = require('express-ejs-layouts');
const MongoStore = require('connect-mongo')(session);

const app = express();

app.set('env', process.env.NODE_ENV || 'development');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression()); 

app.use(express.static(path.join(__dirname, '../public')));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(' MongoDB connection error:', err));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secretKey',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

require('../middleware/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use('/', require('../routes/index'));
app.use('/complaints', require('../routes/complaint')); 
app.use('/feedback', require('../routes/feedback'));
app.use('/users', require('../routes/users'));
app.use('/admin', require('../routes/admin'));
app.use('/staff', require('../routes/staff'));
app.use('/captcha', require('../routes/captcha'));

// ============== 404 Fallback ==============
app.use((req, res) => {
  res.status(404).render('pages/404'); //  make sure views/pages/404.ejs exists
});

// ============== Server Start ==============
const hostname = 'localhost';
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(` Server running at http://${hostname}:${port}/`);
});
