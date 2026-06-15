const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MongooseCompatModel } = require("../utils/mongooseCompat");

class Expense extends MongooseCompatModel {
  get cropId() {
    if (this.cropIdDetails !== undefined) {
      return this.cropIdDetails;
    }
    return this.getDataValue("cropId");
  }
}

Expense.init(
  {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    farmerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cropId: {
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    type: {
      type: DataTypes.ENUM("Seeds", "Fertilizer", "Labour", "Irrigation", "Pesticide", "Equipment", "Other"),
      allowNull: false
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: "Expense",
    tableName: "Expenses",
    timestamps: true
  }
);

module.exports = Expense;
