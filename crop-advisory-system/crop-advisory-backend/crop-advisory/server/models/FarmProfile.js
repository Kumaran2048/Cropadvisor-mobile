const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MongooseCompatModel } = require("../utils/mongooseCompat");

class FarmProfile extends MongooseCompatModel {
  get activeCrop() {
    if (this.activeCropDetails !== undefined) {
      return this.activeCropDetails;
    }
    return this.activeCropId;
  }
}

FarmProfile.init(
  {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    landSize: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    soilType: {
      type: DataTypes.ENUM("Red Soil", "Black Soil", "Loamy Soil", "Sandy Soil", "Alluvial Soil", "Laterite Soil"),
      allowNull: false
    },
    waterSource: {
      type: DataTypes.ENUM("Well", "Canal", "Rain-fed", "Borewell", "River"),
      allowNull: false
    },
    village: {
      type: DataTypes.STRING
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DOUBLE
    },
    longitude: {
      type: DataTypes.DOUBLE
    },
    activeCropId: {
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    sowingDate: {
      type: DataTypes.DATE,
      defaultValue: null
    },
    sowingSeason: {
      type: DataTypes.ENUM("Kharif", "Rabi", "Zaid"),
      defaultValue: null
    }
  },
  {
    sequelize,
    modelName: "FarmProfile",
    tableName: "FarmProfiles",
    timestamps: true
  }
);

module.exports = FarmProfile;
