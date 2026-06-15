const express = require("express");
const router = express.Router();
const { register, login, getMe, changePassword, updateProfile, sendOTP, loginOTP, googleLogin } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/login-otp", loginOTP);
router.post("/google-login", googleLogin);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.put("/profile", protect, updateProfile);

module.exports = router;
