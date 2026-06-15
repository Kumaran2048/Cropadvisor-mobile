const express = require("express");
const router = express.Router();
const { getMyTasks, completeTask } = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyTasks);
router.put("/:id/complete", protect, completeTask);

module.exports = router;
