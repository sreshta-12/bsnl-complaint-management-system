const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const { User } = require('../models/user');

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: '📧 That email is not registered' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: '🔒 Password is incorrect' });
      }
    } catch (err) {
      console.error('Error in passport authentication:', err);
      return done(err);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = initialize;
