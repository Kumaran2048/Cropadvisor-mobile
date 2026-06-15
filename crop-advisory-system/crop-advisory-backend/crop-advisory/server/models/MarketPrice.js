const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MongooseCompatModel } = require("../utils/mongooseCompat");

class MarketPrice extends MongooseCompatModel {}

MarketPrice.init(
  {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cropName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING
    },
    mandiName: {
      type: DataTypes.STRING
    },
    minPrice: {
      type: DataTypes.DOUBLE
    },
    maxPrice: {
      type: DataTypes.DOUBLE
    },
    modalPrice: {
      type: DataTypes.DOUBLE
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: "MarketPrice",
    tableName: "MarketPrices",
    timestamps: true
  }
);

module.exports = MarketPrice;
