const Crop = require("../models/Crop");
const FarmProfile = require("../models/FarmProfile");

// Determine current season based on month
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 10) return "Kharif";   // June to October
  if (month >= 11 || month <= 3) return "Rabi";     // November to March
  return "Zaid";                                      // April to May
};

// ── @GET /api/crop/recommend ─────────────────────────────────────
const getRecommendations = async (req, res) => {
  try {
    // Get farmer's profile
    const profile = await FarmProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({
        message: "Please set up your farm profile first to get recommendations",
      });
    }

    const season = getCurrentSeason();
    const { soilType, waterSource } = profile;

    // Water need mapping
    let waterNeedFilter = [];
    if (waterSource === "Rain-fed") waterNeedFilter = ["Low"];
    else if (waterSource === "Well") waterNeedFilter = ["Low", "Medium"];
    else waterNeedFilter = ["Low", "Medium", "High"];

    // Query matching crops
    const crops = await Crop.find({
      season: season,
      soilTypes: soilType,
      waterNeed: { $in: waterNeedFilter },
    }).limit(6);

    res.json({
      season,
      soilType,
      waterSource,
      recommendedCrops: crops,
      message: `Found ${crops.length} crops suitable for ${season} season with ${soilType}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Recommendation failed", error: error.message });
  }
};

// ── @GET /api/crop/all ───────────────────────────────────────────
const getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find({});
    res.json({ crops });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch crops", error: error.message });
  }
};

// ── @GET /api/crop/:id ───────────────────────────────────────────
const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.json({ crop });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch crop", error: error.message });
  }
};

// ── @POST /api/crop (Admin only) ─────────────────────────────────
const addCrop = async (req, res) => {
  try {
    const crop = await Crop.create(req.body);
    res.status(201).json({ message: "Crop added successfully", crop });
  } catch (error) {
    res.status(500).json({ message: "Failed to add crop", error: error.message });
  }
};

// ── @PUT /api/crop/:id (Admin only) ─────────────────────────────
const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.json({ message: "Crop updated", crop });
  } catch (error) {
    res.status(500).json({ message: "Failed to update crop", error: error.message });
  }
};

// ── @DELETE /api/crop/:id (Admin only) ──────────────────────────
const deleteCrop = async (req, res) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);
    res.json({ message: "Crop deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete crop", error: error.message });
  }
};

module.exports = { getRecommendations, getAllCrops, getCropById, addCrop, updateCrop, deleteCrop };
