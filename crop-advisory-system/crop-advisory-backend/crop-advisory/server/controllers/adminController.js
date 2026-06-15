const User = require("../models/User");
const FarmProfile = require("../models/FarmProfile");
const Alert = require("../models/Alert");
const DailyTask = require("../models/DailyTask");
const DiseaseReport = require("../models/DiseaseReport");
const Expense = require("../models/Expense");
const YieldLog = require("../models/YieldLog");
const bcrypt = require("bcryptjs");

// ── @GET /api/admin/users ──────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const filter = {};
        // If officer, only show users in their district
        if (req.user.role === "officer") {
            filter.district = req.user.district;
        }

        const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
        const profiles = await FarmProfile.find({}).populate('activeCrop');
        
        const profileMap = {};
        profiles.forEach(p => { profileMap[p.userId.toString()] = p; });

        const enrichedUsers = users.map(user => {
            const pData = profileMap[user._id.toString()];
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                district: user.district || (pData ? pData.district : "N/A"),
                state: user.state || (pData ? pData.state : "N/A"),
                isActive: user.isActive,
                landSize: pData ? pData.landSize : null,
                soilType: pData ? pData.soilType : null,
                village: pData && pData.village ? pData.village : "N/A",
                activeCrop: pData && pData.activeCrop ? pData.activeCrop.name : "None",
                createdAt: user.createdAt
            };
        });

        res.json(enrichedUsers);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

// ── @POST /api/admin/users ──────────────────────────────────────────
const addUser = async (req, res) => {
  try {
    const { name, email, password, role, district, state, phone } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name, email, password, role, district, state, phone
    });

    res.status(201).json({ message: "User created successfully", user: { _id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Creation failed", error: error.message });
  }
};

// ── @PATCH /api/admin/users/:id/status ────────────────────────────
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Status updated", isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// ── @DELETE /api/admin/users/:id ──────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Clean up all related tables to avoid MySQL Foreign Key constraint violations (prevent 500 error)
    await Alert.destroy({ where: { farmerId: userId } }).catch(() => {});
    await Alert.destroy({ where: { officerId: userId } }).catch(() => {});
    await DailyTask.destroy({ where: { userId } }).catch(() => {});
    await FarmProfile.destroy({ where: { userId } }).catch(() => {});
    await DiseaseReport.destroy({ where: { farmerId: userId } }).catch(() => {});
    await Expense.destroy({ where: { farmerId: userId } }).catch(() => {});
    await YieldLog.destroy({ where: { farmerId: userId } }).catch(() => {});

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error: error.message });
  }
};

module.exports = { getAllUsers, addUser, updateUserStatus, deleteUser };
