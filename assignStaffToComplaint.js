

require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('./models/complaint');
const User = require('./models/user'); 

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/bsnl-complaints';

async function connectToMongo() {
  try {
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(" Connected to MongoDB");
  } catch (err) {
    console.error(" MongoDB connection error:", err);
  }
}

async function assignStaffToComplaint(circle, department) {
  try {
    console.log(`Assigning staff to complaint with:\nCircle: ${circle}\nDepartment: ${department}`);

    
    const staff = await User.findOne({ role: 'staff', circle, department });

    if (!staff) {
      console.log(" No matching staff found for the given circle and department.");
      return;
    }

    console.log(` Found staff: ${staff.name} (${staff.email})`);

   
    const complaint = await Complaint.findOne({
      serviceType: department,
      circle: circle,
      assignedTo: { $exists: false }
    });

    if (!complaint) {
      console.log(" No unassigned complaint found.");
      return;
    }

    complaint.assignedTo = staff._id;
    await complaint.save();

    console.log(` Assigned complaint ID ${complaint._id} to staff ${staff.name}`);
  } catch (err) {
    console.error(" Error while assigning staff:", err);
  }
}

async function runTest() {
  await connectToMongo();

  const testCircle = "Bihar";
  const testDepartment = "Prepaid";

  await assignStaffToComplaint(testCircle, testDepartment);
  mongoose.disconnect();
}

runTest();
