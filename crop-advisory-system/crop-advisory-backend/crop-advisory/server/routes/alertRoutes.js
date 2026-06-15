const express = require("express");
const router = express.Router();
const { getMyAlerts, createBroadcast, markAsRead, markAllAsRead, replyToAlert } = require("../controllers/alertController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/my-alerts", getMyAlerts);
router.post("/broadcast", createBroadcast);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);
router.post("/:id/reply", replyToAlert);

module.exports = router;
