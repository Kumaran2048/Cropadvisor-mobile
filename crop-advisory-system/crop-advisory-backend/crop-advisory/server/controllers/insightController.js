const Crop = require("../models/Crop");
const FarmProfile = require("../models/FarmProfile");
const WeatherLog = require("../models/WeatherLog");
const MarketPrice = require("../models/MarketPrice");

// ── @GET /api/insights/seasonal-recommendations ──────────────────
const getSeasonalRecommendations = async (req, res) => {
  try {
    const profile = await FarmProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(400).json({ message: "Farm profile not found" });

    const currentMonth = new Date().getMonth(); // 0-11
    let currentSeason = "Kharif";
    if (currentMonth >= 2 && currentMonth <= 5) currentSeason = "Zaid";
    else if (currentMonth >= 6 && currentMonth <= 9) currentSeason = "Kharif";
    else currentSeason = "Rabi";

    const recommendedCrops = await Crop.find({
      season: currentSeason,
      soilTypes: profile.soilType,
      states: profile.state
    }).limit(5);

    res.json({
      season: currentSeason,
      recommendations: recommendedCrops,
      reasoning: `Based on your soil (${profile.soilType}) and current season (${currentSeason}) in ${profile.state}.`
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recommendations", error: error.message });
  }
};

// ── @GET /api/insights/farming-insights ──────────────────────────
const getFarmingInsights = async (req, res) => {
  try {
    const profile = await FarmProfile.findOne({ userId: req.user._id }).populate("activeCrop");
    if (!profile) return res.status(400).json({ message: "Farm profile not found" });

    const insights = [];

    // 1. Market Insight
    if (profile.activeCrop) {
      const latestPrice = await MarketPrice.findOne({ 
        cropName: { $regex: profile.activeCrop.name, $options: "i" } 
      }).sort({ date: -1 });
      
      if (latestPrice && latestPrice.modalPrice > 2500) {
        insights.push(`${profile.activeCrop.name} demand is increasing in nearby markets. Current price is favorable.`);
      }
    }

    // 2. Weather Insight
    const weather = await WeatherLog.findOne({ district: profile.district }).sort({ createdAt: -1 });
    if (weather) {
      if (weather.temperature > 25 && weather.temperature < 35 && weather.humidity < 70) {
        insights.push(`Current weather in ${profile.district} is highly favorable for ${profile.activeCrop?.name || 'crop'} growth.`);
      }
      if (weather.humidity > 80) {
        insights.push(`High humidity increases disease outbreak probability in your district. Monitor your crops closely.`);
      }
    }

    // 3. General AI Insights
    insights.push(`Tip: Using organic mulch can help retain soil moisture during the ${new Date().getHours() > 12 ? 'hot afternoon' : 'morning'}.`);

    res.json({ insights });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch insights", error: error.message });
  }
};

module.exports = { getSeasonalRecommendations, getFarmingInsights };
