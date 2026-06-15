const express = require("express");
const router = express.Router();
const { detectDisease, getDiseaseHistory, getDistrictDiseases, resolveReport } = require("../controllers/diseaseController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/detect", protect, authorize("farmer"), upload.single("image"), detectDisease);
router.get("/history", protect, authorize("farmer"), getDiseaseHistory);
router.get("/district/:district", protect, authorize("officer", "admin"), getDistrictDiseases);
router.patch("/report/:id/resolve", protect, authorize("officer"), resolveReport);

module.exports = router;
