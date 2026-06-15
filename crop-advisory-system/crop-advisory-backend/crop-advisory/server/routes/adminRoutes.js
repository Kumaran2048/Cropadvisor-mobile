const express = require("express");
const router = express.Router();
const { getAllUsers, addUser, updateUserStatus, deleteUser } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/users", protect, authorize("admin", "officer"), getAllUsers);
router.post("/users", protect, authorize("admin"), addUser);
router.patch("/users/:id/status", protect, authorize("admin"), updateUserStatus);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
