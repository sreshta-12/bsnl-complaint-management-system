const mongoose = require('mongoose');
const { User } = require('./models/user');
const bcrypt = require('bcrypt');
const staffData = require('./staff_seed.json');

mongoose.connect('mongodb://localhost:27017/bsnl_portal')
  .then(async () => {
    for (const staff of staffData) {
      // Hash password
      const hashedPassword = await bcrypt.hash(staff.password, 10);
      staff.password = hashedPassword;

      // Insert with hashed password
      await User.updateOne(
        { email: staff.email },
        { $set: staff },
        { upsert: true }
      );
    }

    console.log('Staff data inserted with hashed passwords');
    mongoose.connection.close();
  })
  .catch(err => console.error('Seeding Error:', err));
