const express = require("express");
const router = express.Router();
const { getRecommendations, getAllCrops, getCropById, addCrop, updateCrop, deleteCrop } = require("../controllers/cropController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/recommend", protect, authorize("farmer"), getRecommendations);
router.get("/all", protect, getAllCrops);
router.get("/:id", protect, getCropById);
router.post("/", protect, authorize("admin"), addCrop);
router.put("/:id", protect, authorize("admin"), updateCrop);
router.delete("/:id", protect, authorize("admin"), deleteCrop);

module.exports = router;
