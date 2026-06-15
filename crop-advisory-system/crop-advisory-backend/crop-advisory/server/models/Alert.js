const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MongooseCompatModel } = require("../utils/mongooseCompat");

class Alert extends MongooseCompatModel {}

Alert.init(
  {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    farmerId: {
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    officerId: {
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    type: {
      type: DataTypes.ENUM("Disease Outbreak", "Low Market Price", "Weather Warning", "General"),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    district: {
      type: DataTypes.STRING
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    severity: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      defaultValue: "Medium"
    },
    allowReplies: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    replies: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  },
  {
    sequelize,
    modelName: "Alert",
    tableName: "Alerts",
    timestamps: true
  }
);

module.exports = Alert;
