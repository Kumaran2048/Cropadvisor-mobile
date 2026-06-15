const express = require("express");
const router = express.Router();
const { recommendCrop, predictFertilizer } = require("../controllers/mlController");
const { protect } = require("../middleware/authMiddleware");

router.post("/recommend-crop", protect, recommendCrop);
router.post("/predict-fertilizer", protect, predictFertilizer);

module.exports = router;
