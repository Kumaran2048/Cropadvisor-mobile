const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MongooseCompatModel } = require("../utils/mongooseCompat");

class DiseaseReport extends MongooseCompatModel {
  get cropId() {
    if (this.cropIdDetails !== undefined) {
      return this.cropIdDetails;
    }
    return this.getDataValue("cropId");
  }
}

DiseaseReport.init(
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
    imageUrl: {
      type: DataTypes.STRING
    },
    disease: {
      type: DataTypes.STRING,
      allowNull: false
    },
    confidence: {
      type: DataTypes.FLOAT
    },
    severity: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      defaultValue: "Medium"
    },
    treatment: {
      type: DataTypes.TEXT
    },
    district: {
      type: DataTypes.STRING
    },
    isAlertTriggered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM("pending", "resolved"),
      defaultValue: "pending"
    }
  },
  {
    sequelize,
    modelName: "DiseaseReport",
    tableName: "DiseaseReports",
    timestamps: true
  }
);

module.exports = DiseaseReport;
