const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MongooseCompatModel } = require("../utils/mongooseCompat");

class Crop extends MongooseCompatModel {}

Crop.init(
  {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    localName: {
      type: DataTypes.STRING
    },
    season: {
      type: DataTypes.JSON,
      allowNull: false
    },
    soilTypes: {
      type: DataTypes.JSON,
      allowNull: false
    },
    waterNeed: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      allowNull: false
    },
    waterRequirementMM: {
      type: DataTypes.INTEGER
    },
    growingDurationDays: {
      type: DataTypes.INTEGER
    },
    expectedYieldPerAcre: {
      type: DataTypes.STRING
    },
    commonDiseases: {
      type: DataTypes.JSON
    },
    states: {
      type: DataTypes.JSON
    },
    description: {
      type: DataTypes.TEXT
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    maintenanceTips: {
      type: DataTypes.JSON
    },
    fertilizerSchedule: {
      type: DataTypes.JSON
    },
    wateringSchedule: {
      type: DataTypes.JSON
    },
    pestRisks: {
      type: DataTypes.JSON
    },
    idealConditions: {
      type: DataTypes.JSON
    }
  },
  {
    sequelize,
    modelName: "Crop",
    tableName: "Crops",
    timestamps: true
  }
);

module.exports = Crop;
