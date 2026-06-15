const mysql = require("mysql2/promise");
const sequelize = require("./sequelize");

// Import all models to register and define relationships
const User = require("../models/User");
const Crop = require("../models/Crop");
const FarmProfile = require("../models/FarmProfile");
const Alert = require("../models/Alert");
const DailyTask = require("../models/DailyTask");
const DiseaseReport = require("../models/DiseaseReport");
const Expense = require("../models/Expense");
const GovernmentScheme = require("../models/GovernmentScheme");
const MarketPrice = require("../models/MarketPrice");
const WeatherLog = require("../models/WeatherLog");
const YieldLog = require("../models/YieldLog");

const connectDB = async (forceSync = false) => {
  try {
    // Ensure database exists in MySQL
    const host = process.env.DB_HOST || "127.0.0.1";
    const port = process.env.DB_PORT || 3306;
    const user = process.env.DB_USER || "root";
    const password = process.env.DB_PASSWORD || "";
    const dbName = process.env.DB_NAME || "crop_advisory";

    // Only attempt raw connection and DB creation/drop queries if not in production (e.g. Aiven)
    const isProduction = process.env.NODE_ENV === "production" || process.env.DB_SSL === "true";
    if (!isProduction) {
      try {
        const connection = await mysql.createConnection({ host, port, user, password });
        if (forceSync) {
          await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
          console.log(`Database \`${dbName}\` dropped for clean recreation 🧹`);
        }
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.end();
      } catch (rawError) {
        console.warn(`Raw MySQL connection skipped or failed: ${rawError.message}`);
      }
    }

    // Authenticate connection
    await sequelize.authenticate();
    console.log("MySQL Connected successfully ✅");

    // Define Associations
    // User <-> FarmProfile
    User.hasOne(FarmProfile, { foreignKey: "userId", sourceKey: "_id", as: "farmProfile" });
    FarmProfile.belongsTo(User, { foreignKey: "userId", targetKey: "_id", as: "user" });

    // FarmProfile -> Crop (activeCrop)
    FarmProfile.belongsTo(Crop, { foreignKey: "activeCropId", targetKey: "_id", as: "activeCropDetails" });

    // Alert -> User
    Alert.belongsTo(User, { foreignKey: "farmerId", targetKey: "_id", as: "farmer" });
    Alert.belongsTo(User, { foreignKey: "officerId", targetKey: "_id", as: "officer" });

    // DiseaseReport -> User, Crop
    DiseaseReport.belongsTo(User, { foreignKey: "farmerId", targetKey: "_id", as: "farmer" });
    DiseaseReport.belongsTo(Crop, { foreignKey: "cropId", targetKey: "_id", as: "cropIdDetails" });

    // Expense -> User, Crop
    Expense.belongsTo(User, { foreignKey: "farmerId", targetKey: "_id", as: "farmer" });
    Expense.belongsTo(Crop, { foreignKey: "cropId", targetKey: "_id", as: "cropIdDetails" });

    // YieldLog -> User, Crop
    YieldLog.belongsTo(User, { foreignKey: "farmerId", targetKey: "_id", as: "farmer" });
    YieldLog.belongsTo(Crop, { foreignKey: "cropId", targetKey: "_id", as: "cropIdDetails" });

    // DailyTask -> User
    DailyTask.belongsTo(User, { foreignKey: "userId", targetKey: "_id", as: "user" });

    // Sync database models with MySQL database tables
    const shouldReset = forceSync || process.env.DB_RESET === "true";
    if (shouldReset) {
      console.log("Database reset triggered 🧹 Wiping duplicate indexes and recreating tables...");
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
      await sequelize.sync({ force: true });
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
      console.log("Database tables cleanly recreated! ✅");
    } else {
      // In production, sync() without alter: true avoids index duplication bugs
      await sequelize.sync();
    }
    console.log("MySQL Database synced ✅");
  } catch (error) {
    console.error(`MySQL Connection/Sync Error: ${error.message}`);
    process.exit(1); // Stop server if DB fails
  }
};

module.exports = connectDB;
