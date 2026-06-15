const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MongooseCompatModel } = require("../utils/mongooseCompat");

class YieldLog extends MongooseCompatModel {
  get cropId() {
    if (this.cropIdDetails !== undefined) {
      return this.cropIdDetails;
    }
    return this.getDataValue("cropId");
  }
}

YieldLog.init(
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
      allowNull: false
    },
    season: {
      type: DataTypes.ENUM("Kharif", "Rabi", "Zaid")
    },
    year: {
      type: DataTypes.INTEGER
    },
    quantityQuintals: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    sellingPricePerQuintal: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    totalRevenue: {
      type: DataTypes.DOUBLE
    },
    totalExpenses: {
      type: DataTypes.DOUBLE
    },
    netProfit: {
      type: DataTypes.DOUBLE
    },
    notes: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    modelName: "YieldLog",
    tableName: "YieldLogs",
    timestamps: true
  }
);

// Auto-calculate revenue and profit before saving
YieldLog.beforeSave((yieldLog) => {
  yieldLog.totalRevenue = yieldLog.quantityQuintals * yieldLog.sellingPricePerQuintal;
  if (yieldLog.totalExpenses) {
    yieldLog.netProfit = yieldLog.totalRevenue - yieldLog.totalExpenses;
  } else {
    yieldLog.netProfit = yieldLog.totalRevenue;
  }
});

module.exports = YieldLog;
