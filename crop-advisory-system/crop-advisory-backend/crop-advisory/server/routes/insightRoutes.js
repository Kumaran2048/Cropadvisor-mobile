const express = require("express");
const router = express.Router();
const { getSeasonalRecommendations, getFarmingInsights } = require("../controllers/insightController");
const { protect } = require("../middleware/authMiddleware");

router.get("/seasonal", protect, getSeasonalRecommendations);
router.get("/ai-insights", protect, getFarmingInsights);

module.exports = router;
