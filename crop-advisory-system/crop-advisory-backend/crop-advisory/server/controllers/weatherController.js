const axios = require("axios");
const WeatherLog = require("../models/WeatherLog");
const FarmProfile = require("../models/FarmProfile");
const Crop = require("../models/Crop");

// Water need in mm per week (approximate)
const cropWaterNeeds = {
  Low: 15,
  Medium: 30,
  High: 50,
};

// ── @GET /api/weather/current ────────────────────────────────────
const getCurrentWeather = async (req, res) => {
  try {
    const profile = await FarmProfile.findOne({ userId: req.user._id });
    const district = profile ? profile.district : req.user.district;

    if (!district) {
      return res.status(400).json({ message: "District not found for user" });
    }

    // Try fetching from DB first (cached today's data)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let weatherLog = await WeatherLog.findOne({ district, date: { $gte: today } });

    if (!weatherLog) {
      try {
        // Fetch from OpenWeather API
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${district},IN&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        const data = response.data;
        weatherLog = await WeatherLog.create({
          district,
          temperature: data.main.temp,
          humidity: data.main.humidity,
          rainfall: data.rain ? data.rain["1h"] || 0 : 0,
          windSpeed: data.wind.speed,
          description: data.weather[0].description,
        });
      } catch (apiError) {
        console.warn("Weather API Failed (Fallback to Mock):", apiError.message);
        // Fallback mock weather so the presentation doesn't break if API key is inactive
        weatherLog = {
          district: district,
          temperature: 28.5,
          humidity: 65,
          rainfall: 2,
          windSpeed: 4.5,
          description: "partly cloudy (mock data)",
        };
      }
    }

    // Generate irrigation advice
    const irrigationAdvice = await generateIrrigationAdvice(profile, weatherLog);

    // Generate Weather Impact Analysis
    const impactAnalysis = generateWeatherImpactAnalysis(weatherLog);

    res.json({ 
      weather: weatherLog, 
      irrigationAdvice,
      impactAnalysis
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch weather", error: error.message });
  }
};

const generateWeatherImpactAnalysis = (weather) => {
  const impacts = [];
  const temp = weather.temperature;
  const hum = weather.humidity;
  const rain = weather.rainfall;

  if (rain > 15) impacts.push("Heavy rain expected → skip irrigation and ensure proper drainage.");
  if (rain > 50) impacts.push("FLOOD WARNING: Potential for waterlogging in low-lying fields.");
  if (temp > 40) impacts.push("Extreme heat alert: High risk of crop wilting and moisture loss.");
  if (hum > 85 && temp > 25) impacts.push("High humidity & warmth: Increased risk of fungal diseases like leaf blight.");
  if (weather.windSpeed > 30) impacts.push("High winds detected: Risk of crop lodging (falling over).");
  
  if (impacts.length === 0) {
    impacts.push("Current weather is favorable for standard crop growth.");
  }

  return impacts;
};

// Generate irrigation suggestion based on crop + weather
const generateIrrigationAdvice = async (profile, weather) => {
  if (!profile || !profile.activeCrop) {
    return "Select an active crop to get irrigation advice.";
  }

  const crop = await Crop.findById(profile.activeCrop);
  if (!crop) return "Crop data not found.";

  const weeklyNeed = cropWaterNeeds[crop.waterNeed] || 30;
  const rainfall = weather.rainfall || 0;
  const temp = weather.temperature || 25;

  if (rainfall >= weeklyNeed) {
    return `Good news! Recent rainfall (${rainfall}mm) meets your ${crop.name}'s water needs. No irrigation needed today.`;
  }

  if (temp > 38) {
    return `High temperature alert (${temp}°C)! Your ${crop.name} needs extra water. Irrigate early morning or evening.`;
  }

  if (rainfall > 0 && rainfall < weeklyNeed / 2) {
    return `Light rainfall received (${rainfall}mm). Your ${crop.name} still needs irrigation. Provide ${weeklyNeed - rainfall}mm more water.`;
  }

  return `No rainfall detected. Your ${crop.name} requires approximately ${weeklyNeed}mm of water this week. Irrigate as per your schedule.`;
};

// ── @GET /api/weather/forecast ───────────────────────────────────
const getWeatherForecast = async (req, res) => {
  try {
    const profile = await FarmProfile.findOne({ userId: req.user._id });
    const district = profile ? profile.district : req.user.district;
    
    if (!district) return res.status(400).json({ message: "District not found for user" });

    let forecast = [];
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${district},IN&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
      );

      // Filter to get one forecast per day (closest to 12:00:00)
      const dailyForecast = [];
      const seenDates = new Set();

      response.data.list.forEach((item) => {
        const date = item.dt_txt.split(' ')[0];
        if (!seenDates.has(date) && item.dt_txt.includes("12:00:00")) {
          dailyForecast.push({
            date: item.dt_txt,
            temp: item.main.temp,
            humidity: item.main.humidity,
            rainfall: item.rain ? item.rain["3h"] || 0 : 0,
            description: item.weather[0].description,
          });
          seenDates.add(date);
        }
      });

      // If for some reason we don't have enough 12:00 records, just take unique days
      if (dailyForecast.length < 5) {
        response.data.list.forEach((item) => {
          const date = item.dt_txt.split(' ')[0];
          if (!seenDates.has(date)) {
            dailyForecast.push({
              date: item.dt_txt,
              temp: item.main.temp,
              humidity: item.main.humidity,
              rainfall: item.rain ? item.rain["3h"] || 0 : 0,
              description: item.weather[0].description,
            });
            seenDates.add(date);
          }
        });
      }

      forecast = dailyForecast.slice(0, 5);
    } catch (apiError) {
      console.warn("Forecast API Failed (Fallback to Mock):", apiError.message);
      // Generate some dummy forecast data so the UI doesn't crash
      for (let i = 1; i <= 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        forecast.push({
          date: d.toISOString().split('T')[0] + " 12:00:00",
          temp: 28 - (i % 3),
          humidity: 60 + i * 2,
          rainfall: i % 2 === 0 ? 0 : 5,
          description: "mostly sunny (mock data)",
        });
      }
    }

    res.json({ district: district, forecast });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch forecast", error: error.message });
  }
};

module.exports = { getCurrentWeather, getWeatherForecast };
