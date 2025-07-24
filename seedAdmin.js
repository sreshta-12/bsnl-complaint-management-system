require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models/user');

mongoose
  .connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB ✅');

    const existingAdmin = await User.findOne({ email: 'admin@bsnl.in' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists.');
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = new User({
      name: 'BSNL Admin',
      email: 'admin@bsnl.in',
      mobile: '9999999999',
      password: hashedPassword,
      department: 'Central',
      role: 'admin'
    });

    await adminUser.save();
    console.log(' Admin user created: Email: admin@bsnl.in | Password: admin123');
    process.exit();
  })
  .catch((err) => {
    console.error(' Error connecting to MongoDB:', err);
    process.exit(1);
  });
