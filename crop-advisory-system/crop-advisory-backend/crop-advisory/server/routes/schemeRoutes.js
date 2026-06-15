const express = require("express");
const router = express.Router();
const { getEligibleSchemes } = require("../controllers/schemeController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getEligibleSchemes);

module.exports = router;
