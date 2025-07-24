require('dotenv').config();
const mongoose = require('mongoose');
const { Complaint } = require('./models/complaint');

const normalizeStatus = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const mappings = {
      'New': 'New',
      'new': 'New',
      'pending': 'In Progress',
      'in progress': 'In Progress',
      'In Progress': 'In Progress',
      'done': 'Resolved',
      'Resolved': 'Resolved'
    };

    let total = 0;

    for (const [from, to] of Object.entries(mappings)) {
      const result = await Complaint.updateMany({ status: from }, { $set: { status: to } });
      console.log(`Updated ${result.modifiedCount} complaints: "${from}" → "${to}"`);
      total += result.modifiedCount;
    }

    console.log(` Total status fields normalized: ${total}`);
    process.exit();
  } catch (err) {
    console.error(' Error normalizing status values:', err);
    process.exit(1);
  }
};

normalizeStatus();
