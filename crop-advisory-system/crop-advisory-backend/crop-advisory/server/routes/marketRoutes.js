const express = require("express");
const router = express.Router();
const { getMarketPrices, addMarketPrice, getAllCropPrices, getPriceHistory } = require("../controllers/marketController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/prices", protect, getMarketPrices);
router.get("/all-crops", protect, getAllCropPrices);
router.get("/history", protect, getPriceHistory);
router.post("/prices", protect, authorize("admin"), addMarketPrice);

module.exports = router;
