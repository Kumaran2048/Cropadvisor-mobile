const FarmProfile = require("../models/FarmProfile");
const Crop = require("../models/Crop");
const MarketPrice = require("../models/MarketPrice");

// ── @POST /api/farm/profile ──────────────────────────────────────
const createOrUpdateProfile = async (req, res) => {
  try {
    const { landSize, soilType, waterSource, village, district, state, latitude, longitude } = req.body;

    // Check if profile already exists
    let profile = await FarmProfile.findOne({ userId: req.user._id });

    if (profile) {
      // Update existing
      profile = await FarmProfile.findOneAndUpdate(
        { userId: req.user._id },
        { landSize, soilType, waterSource, village, district, state, latitude, longitude },
        { new: true }
      );
      return res.json({ message: "Farm profile updated", profile });
    }

    // Create new
    profile = await FarmProfile.create({
      userId: req.user._id,
      landSize,
      soilType,
      waterSource,
      village,
      district,
      state,
      latitude,
      longitude,
    });

    res.status(201).json({ message: "Farm profile created", profile });
  } catch (error) {
    res.status(500).json({ message: "Failed to save farm profile", error: error.message });
  }
};

// ── @GET /api/farm/profile ───────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const profile = await FarmProfile.findOne({ userId: req.user._id }).populate("activeCrop");
    if (!profile) {
      return res.status(404).json({ message: "Farm profile not found. Please set up your farm." });
    }
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: "Failed to get farm profile", error: error.message });
  }
};

// ── @PUT /api/farm/select-crop ───────────────────────────────────
const selectActiveCrop = async (req, res) => {
  try {
    let { cropId } = req.body;

    if (!cropId) {
      cropId = "Rice"; // Default fallback crop name
    }

    // Find crop by matching ID or name case-insensitively
    const crops = await Crop.findAll();
    let crop = crops.find(c => 
      c._id.toString() === cropId.toString() || 
      c.name.toLowerCase() === cropId.toString().toLowerCase()
    );

    // If still not found, create a new crop record dynamically so it never fails!
    if (!crop) {
      const name = cropId.toString().charAt(0).toUpperCase() + cropId.toString().slice(1).toLowerCase();
      crop = await Crop.create({
        name,
        season: ["Kharif", "Rabi"],
        soilTypes: ["Loamy Soil"],
        waterNeed: "Medium",
        growingDurationDays: 90,
        expectedYieldPerAcre: "20-25 quintals"
      });
    }

    const profile = await FarmProfile.findOneAndUpdate(
      { userId: req.user._id },
      { 
        activeCropId: crop._id,
        $setOnInsert: {
          district: req.user.district,
          state: req.user.state || "N/A",
          landSize: 1, // Default fallback
          soilType: "Loamy Soil", // Fixed ENUM fallback
          waterSource: "Rain-fed" // Added required field
        }
      },
      { new: true, upsert: true }
    ).populate("activeCrop");

    res.json({ message: `Active crop set to ${crop.name}`, profile });
  } catch (error) {
    res.status(500).json({ message: "Failed to set active crop", error: error.message });
  }
};

// ── @POST /api/farm/predict-profit (What-if Simulation) ───────────
const predictProfit = async (req, res) => {
  try {
    const { cropId, landSize } = req.body;
    if (!cropId || !landSize) {
      return res.status(400).json({ message: "Crop ID and land size are required" });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    // Fetch latest market price for this crop (fallback to mock if not found)
    const latestPrice = await MarketPrice.findOne({ cropName: { $regex: crop.name, $options: "i" } }).sort({ date: -1 });
    const modalPricePerQuintal = latestPrice ? latestPrice.modalPrice : 2500; // default to 2500 Rs/quintal if no data

    // Extract expected yield (e.g., "20-25 tons" or "20-22 quintals") and convert to quintals
    // 1 ton = 10 quintals
    let yieldPerAcreQuintals = 20; // default
    if (crop.expectedYieldPerAcre) {
      const match = crop.expectedYieldPerAcre.match(/(\d+)/);
      if (match) {
        let val = parseInt(match[1]);
        if (crop.expectedYieldPerAcre.toLowerCase().includes("ton")) {
          val = val * 10;
        }
        yieldPerAcreQuintals = val;
      }
    }

    const totalYieldQuintals = yieldPerAcreQuintals * landSize;
    const expectedRevenue = totalYieldQuintals * modalPricePerQuintal;
    
    // Assume average cost of cultivation per acre is Rs 15,000 (mock data)
    const cultivationCostPerAcre = 15000;
    const totalCost = cultivationCostPerAcre * landSize;

    const expectedProfit = expectedRevenue - totalCost;

    res.json({
      crop: crop.name,
      landSize: landSize,
      totalYieldQuintals: totalYieldQuintals,
      marketPricePerQuintal: modalPricePerQuintal,
      expectedRevenue: expectedRevenue,
      estimatedCost: totalCost,
      expectedProfit: expectedProfit
    });
  } catch (error) {
    res.status(500).json({ message: "Prediction failed", error: error.message });
  }
};

module.exports = { createOrUpdateProfile, getProfile, selectActiveCrop, predictProfit };
