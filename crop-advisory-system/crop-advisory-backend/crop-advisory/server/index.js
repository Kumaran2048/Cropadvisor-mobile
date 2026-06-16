const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { apmMiddleware, getApmStats } = require("./middleware/apmMiddleware");

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── APM Middleware (First in Chain) ──────────────────
app.use(apmMiddleware);

// ── Middleware ──────────────────────────────────────
app.use(morgan("dev"));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8081",
    "https://pdd-plum.vercel.app",
    "https://pdd-nine-eosin.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/farm", require("./routes/farmRoutes"));
app.use("/api/crop", require("./routes/cropRoutes"));
app.use("/api/disease", require("./routes/diseaseRoutes"));
app.use("/api/weather", require("./routes/weatherRoutes"));
app.use("/api/market", require("./routes/marketRoutes"));
app.use("/api/expense", require("./routes/expenseRoutes"));
app.use("/api/alert", require("./routes/alertRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/schemes", require("./routes/schemeRoutes"));
app.use("/api/insights", require("./routes/insightRoutes"));
app.use("/api/ml", require("./routes/mlRoutes"));

// ── Health Check ────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Crop Advisory API is running ✅" });
});

// ── APM stats ───────────────────────────────────────
app.get("/api/apm/stats", (req, res) => {
  res.json({
    status: "Healthy",
    api: "Crop Advisory API ✅",
    timestamp: new Date(),
    apm: getApmStats(),
  });
});

// ── Global Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
