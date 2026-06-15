const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "crop_advisory",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    dialectOptions: process.env.DB_SSL === "true" || process.env.NODE_ENV === "production" ? {
      ssl: {
        rejectUnauthorized: false
      }
    } : {},
    define: {
      timestamps: true
    }
  }
);

module.exports = sequelize;
