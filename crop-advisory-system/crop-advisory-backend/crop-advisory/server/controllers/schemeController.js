const GovernmentScheme = require("../models/GovernmentScheme");
const FarmProfile = require("../models/FarmProfile");

// ── @GET /api/schemes ──────────────────────────────────────────────
const getEligibleSchemes = async (req, res) => {
  try {
    const profile = await FarmProfile.findOne({ userId: req.user._id }).populate("activeCrop");
    if (!profile) return res.status(400).json({ message: "Farm profile not found" });

    const query = {
      state: profile.state,
      $or: [
        { "eligibility.landSizeMax": { $gte: profile.landSize } },
        { "eligibility.landSizeMax": null }
      ]
    };

    if (profile.activeCrop) {
      query.$or.push({ "eligibility.cropTypes": profile.activeCrop.name });
    }

    const schemes = await GovernmentScheme.find(query);
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch schemes", error: error.message });
  }
};

module.exports = { getEligibleSchemes };
