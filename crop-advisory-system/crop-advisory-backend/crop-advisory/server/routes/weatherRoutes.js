const express = require("express");
const router = express.Router();
const { getCurrentWeather, getWeatherForecast } = require("../controllers/weatherController");
const { protect } = require("../middleware/authMiddleware");

router.get("/current", protect, getCurrentWeather);
router.get("/forecast", protect, getWeatherForecast);

module.exports = router;
