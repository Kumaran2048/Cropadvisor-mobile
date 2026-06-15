const DailyTask = require("../models/DailyTask");
const FarmProfile = require("../models/FarmProfile");
const Crop = require("../models/Crop");
const WeatherLog = require("../models/WeatherLog");

// ── Generate Daily Tasks ──────────────────────────────────────────
const generateTasksForUser = async (userId) => {
  const profile = await FarmProfile.findOne({ userId }).populate("activeCrop");
  if (!profile || !profile.activeCrop) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if tasks already exist for today
  let tasks = await DailyTask.find({ userId, date: today });
  if (tasks.length > 0) return tasks;

  const crop = profile.activeCrop;
  const daysSinceSowing = Math.floor((today - profile.sowingDate) / (1000 * 60 * 60 * 24));

  const newTasks = [];

  // 1. Fertilizer Tasks from schedule
  if (crop.fertilizerSchedule) {
    const fertTask = crop.fertilizerSchedule.find(s => s.day === daysSinceSowing);
    if (fertTask) {
      newTasks.push({
        userId,
        title: `Apply ${fertTask.fertilizerType}`,
        description: fertTask.instruction,
        type: "Fertilizer",
        date: today,
        priority: "High"
      });
    }
  }

  // 2. Watering Tasks
  if (crop.wateringSchedule) {
    newTasks.push({
      userId,
        title: `Irrigate ${crop.name}`,
        description: crop.wateringSchedule.instructions || "Standard watering needed today.",
        type: "Irrigation",
        date: today,
        priority: "Medium"
    });
  }

  // 3. Weather-based Precautions
  const weather = await WeatherLog.findOne({ district: profile.district }).sort({ createdAt: -1 });
  if (weather) {
    if (weather.rainfall > 10) {
      newTasks.push({
        userId,
        title: "Avoid Pesticide Spraying",
        description: "Heavy rain detected. Pesticides will wash off.",
        type: "Weather Precaution",
        date: today,
        priority: "High"
      });
      // Optionally modify irrigation task
      const irrTask = newTasks.find(t => t.type === "Irrigation");
      if (irrTask) irrTask.description += " (Rain detected, consider skipping)";
    }
    if (weather.temperature > 38) {
        newTasks.push({
          userId,
          title: "Extreme Heat Alert",
          description: "High temperature detected. Water your crops in the evening to avoid evaporation.",
          type: "Weather Precaution",
          date: today,
          priority: "High"
        });
      }
  }

  if (newTasks.length > 0) {
    return await DailyTask.insertMany(newTasks);
  }

  return [];
};

// ── @GET /api/tasks ──────────────────────────────────────────────
const getMyTasks = async (req, res) => {
  try {
    const tasks = await generateTasksForUser(req.user._id);
    // Fetch all for today (both new and existing)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allTodayTasks = await DailyTask.find({ userId: req.user._id, date: today });
    res.json(allTodayTasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

// ── @PUT /api/tasks/:id/complete ──────────────────────────────────
const completeTask = async (req, res) => {
  try {
    const task = await DailyTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isCompleted: true },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to complete task", error: error.message });
  }
};

module.exports = { getMyTasks, completeTask };
