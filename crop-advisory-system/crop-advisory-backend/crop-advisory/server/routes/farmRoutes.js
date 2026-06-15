const express = require("express");
const router = express.Router();
const { createOrUpdateProfile, getProfile, selectActiveCrop, predictProfit } = require("../controllers/farmController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/profile", protect, authorize("farmer"), createOrUpdateProfile);
router.get("/profile", protect, authorize("farmer"), getProfile);
router.put("/select-crop", protect, authorize("farmer"), selectActiveCrop);
router.post("/predict-profit", protect, authorize("farmer"), predictProfit);

module.exports = router;
