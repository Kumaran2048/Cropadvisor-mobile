const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MongooseCompatModel } = require("../utils/mongooseCompat");

class GovernmentScheme extends MongooseCompatModel {}

GovernmentScheme.init(
  {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    eligibility: {
      type: DataTypes.JSON
    },
    benefits: {
      type: DataTypes.TEXT
    },
    link: {
      type: DataTypes.STRING
    },
    category: {
      type: DataTypes.ENUM("Subsidy", "Insurance", "Fertilizer", "Water Management", "Other"),
      defaultValue: "Other"
    }
  },
  {
    sequelize,
    modelName: "GovernmentScheme",
    tableName: "GovernmentSchemes",
    timestamps: true
  }
);

module.exports = GovernmentScheme;
