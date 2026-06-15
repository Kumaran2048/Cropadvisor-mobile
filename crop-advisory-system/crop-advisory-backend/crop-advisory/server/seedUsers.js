const connectDB = require("./config/db");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    console.log("Database Connected for User Seeding...");

    // Clear existing demo users to avoid conflicts
    await User.deleteMany({ email: { $in: ["farmer@demo.com", "officer@demo.com", "admin@demo.com"] } });

    const users = [
      {
        name: "Farmer Demo",
        email: "farmer@demo.com",
        password: "password123",
        phone: "9876543210",
        role: "farmer",
        district: "Nashik",
        state: "Maharashtra",
        preferredLanguage: "English"
      },
      {
        name: "Officer Demo",
        email: "officer@demo.com",
        password: "password123",
        phone: "9876543211",
        role: "officer",
        district: "Nashik",
        state: "Maharashtra",
        preferredLanguage: "English"
      },
      {
        name: "Admin Kumaran",
        email: "kumaran@gmail.com",
        password: "123456",
        phone: "9876543212",
        role: "admin",
        district: "Nashik",
        state: "Maharashtra",
        preferredLanguage: "English"
      }
    ];

    for (const u of users) {
      // Create user (password will be hashed by the User model's pre-save hook)
      await User.create(u);
    }

    console.log("Demo Users Seeded Successfully! ✅");
    console.log("--------------------------------");
    console.log("Farmer: farmer@demo.com / password123");
    console.log("Officer: officer@demo.com / password123");
    console.log("Admin: admin@demo.com / password123");
    console.log("--------------------------------");
    
    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

seedUsers();
