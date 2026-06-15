const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MongooseCompatModel } = require("../utils/mongooseCompat");

class WeatherLog extends MongooseCompatModel {}

WeatherLog.init(
  {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING
    },
    temperature: {
      type: DataTypes.DOUBLE
    },
    humidity: {
      type: DataTypes.DOUBLE
    },
    rainfall: {
      type: DataTypes.DOUBLE
    },
    windSpeed: {
      type: DataTypes.DOUBLE
    },
    description: {
      type: DataTypes.STRING
    },
    forecast: {
      type: DataTypes.JSON
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: "WeatherLog",
    tableName: "WeatherLogs",
    timestamps: true
  }
);

module.exports = WeatherLog;
