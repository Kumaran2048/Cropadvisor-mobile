const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MongooseCompatModel } = require("../utils/mongooseCompat");

class DailyTask extends MongooseCompatModel {}

DailyTask.init(
  {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.ENUM("Irrigation", "Fertilizer", "Pesticide", "Harvesting", "Weather Precaution", "General"),
      defaultValue: "General"
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      defaultValue: "Medium"
    }
  },
  {
    sequelize,
    modelName: "DailyTask",
    tableName: "DailyTasks",
    timestamps: true
  }
);

module.exports = DailyTask;
