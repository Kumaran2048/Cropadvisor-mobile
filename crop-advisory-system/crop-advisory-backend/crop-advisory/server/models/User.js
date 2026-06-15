const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MongooseCompatModel } = require("../utils/mongooseCompat");
const bcrypt = require("bcryptjs");

class User extends MongooseCompatModel {}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      unique: true
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true
    },
    otp: {
      type: DataTypes.STRING
    },
    otpExpires: {
      type: DataTypes.DATE
    },
    role: {
      type: DataTypes.ENUM("farmer", "officer", "admin"),
      defaultValue: "farmer"
    },
    district: {
      type: DataTypes.STRING
    },
    state: {
      type: DataTypes.STRING
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    preferredLanguage: {
      type: DataTypes.ENUM("English", "Tamil", "Kannada", "Telugu", "Malayalam", "Hindi"),
      defaultValue: "English"
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users",
    timestamps: true
  }
);

// Hash password before saving
User.beforeSave(async (user) => {
  if (user.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Compare password instance method
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
