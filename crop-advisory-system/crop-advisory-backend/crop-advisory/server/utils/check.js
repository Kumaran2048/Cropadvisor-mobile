const connectDB = require('../config/db');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const FarmProfile = require('../models/FarmProfile');

const checkDB = async () => {
  try {
    await connectDB();
    const farmer = await User.findOne({ email: 'farmer@demo.com' });
    if (!farmer) {
      console.log('Farmer not found');
    } else {
      console.log('Farmer found:', farmer._id);
      const profile = await FarmProfile.findOne({ userId: farmer._id });
      console.log('Profile found:', profile);
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkDB();
