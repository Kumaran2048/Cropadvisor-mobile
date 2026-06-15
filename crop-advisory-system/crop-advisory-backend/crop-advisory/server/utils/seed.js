const connectDB = require('../config/db');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');

const demoUsers = [
  {
    name: 'Farmer Demo',
    email: 'farmer@demo.com',
    password: 'password',
    role: 'farmer',
    district: 'Nashik',
    state: 'Maharashtra',
    phone: '9123456789'
  },
  {
    name: 'Officer Priya',
    email: 'officer@demo.com',
    password: 'password',
    role: 'officer',
    district: 'Nashik',
    state: 'Maharashtra',
    phone: '9876543210'
  },
  {
    name: 'Admin Kumaran',
    email: 'kumaran@gmail.com',
    password: '123456',
    role: 'admin',
    district: 'N/A',
    state: 'Maharashtra',
    phone: '9000000000'
  }
];

const Crop = require('../models/Crop');
const FarmProfile = require('../models/FarmProfile');

const demoCrops = [
  { name: 'Tomato', season: ['Kharif'], soilTypes: ['Loamy Soil'], waterNeed: 'High', waterRequirementMM: 600, growingDurationDays: 90, expectedYieldPerAcre: '20-25 tons' },
  { name: 'Potato', season: ['Rabi'], soilTypes: ['Sandy Soil'], waterNeed: 'Medium', waterRequirementMM: 500, growingDurationDays: 100, expectedYieldPerAcre: '15-20 tons' },
  { name: 'Wheat', season: ['Rabi'], soilTypes: ['Alluvial Soil'], waterNeed: 'Medium', waterRequirementMM: 450, growingDurationDays: 120, expectedYieldPerAcre: '20-22 quintals' },
  { name: 'Maize', season: ['Kharif', 'Zaid'], soilTypes: ['Red Soil'], waterNeed: 'Medium', waterRequirementMM: 550, growingDurationDays: 110, expectedYieldPerAcre: '25-30 quintals' }
];

const seedDB = async () => {
  try {
    await connectDB(true);
    console.log('Database connected for seeding...');

    // Clear existing data
    await User.deleteMany({ email: { $in: demoUsers.map(u => u.email) } });
    await Crop.deleteMany({});
    await FarmProfile.deleteMany({});
    console.log('Cleared existing demo data.');

    // Add new demo users
    const createdUsers = [];
    for (const u of demoUsers) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log('Demo users seeded.');

    // Add demo crops
    const createdCrops = await Crop.insertMany(demoCrops);
    console.log('Demo crops seeded.');

    // Add farm profile for farmer demo
    const farmer = createdUsers.find(u => u.email === 'farmer@demo.com');
    if (farmer) {
      await FarmProfile.create({
        userId: farmer._id,
        landSize: 4.5,
        soilType: 'Loamy Soil',
        waterSource: 'Well',
        village: 'Khed',
        district: 'Nashik',
        state: 'Maharashtra',
        activeCrop: createdCrops[0]._id // Tomato
      });
      console.log('Farm profile created for demo farmer.');
    }

    console.log('Database seeded successfully! ✅');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
