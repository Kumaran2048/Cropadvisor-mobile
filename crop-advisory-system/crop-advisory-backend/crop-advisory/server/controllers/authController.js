const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendRealTimeEmail, sendRealTimeSMS } = require("../utils/notificationService");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// ── @POST /api/auth/register ─────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, district, state } = req.body;
    const { SUPPORTED_REGIONS, LANGUAGE_MAP } = require("../utils/constants");

    // Check if state is supported
    if (!SUPPORTED_REGIONS[state]) {
      return res.status(400).json({ 
        message: "Service currently available only in selected states: Tamil Nadu, Karnataka, Kerala, Andhra Pradesh, Telangana, Maharashtra" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: "User already exists with this phone number" });
      }
    }

    // Determine preferred language based on state
    const preferredLanguage = LANGUAGE_MAP[state] || "English";

    // Create new user (password auto-hashed in model)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || "farmer",
      district,
      state,
      preferredLanguage
    });

    // Send real-time welcome notifications
    sendRealTimeEmail(
      user.email,
      "Welcome to CropAdvisor!",
      `Hello ${user.name},\n\nWelcome to CropAdvisor - Smart farming for every field! Your account as a ${user.role} has been created successfully.`
    );
    if (user.phone) {
      sendRealTimeSMS(
        user.phone,
        `Hello ${user.name}, Welcome to CropAdvisor! Your registration as ${user.role} is successful.`
      );
    }

    // Return user data + token
    res.status(201).json({
      message: "Registration successful",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        state: user.state,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// ── @POST /api/auth/login ────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated. Contact admin." });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`Password mismatch for: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`Login successful for: ${email}`);

    // Return user data + token
    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        state: user.state,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// ── @GET /api/auth/me ────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to get user", error: error.message });
  }
};

// ── @PUT /api/auth/change-password ──────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save(); // triggers pre-save hash

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};

// ── @PUT /api/auth/profile ──────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, district, state } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, district, state },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

// ── @POST /api/auth/send-otp ─────────────────────────────────────
const sendOTP = async (req, res) => {
  try {
    const { phoneOrEmail } = req.body;
    if (!phoneOrEmail) {
      return res.status(400).json({ message: "Please provide registered phone number or email" });
    }

    // Find user by phone or email (MongooseCompat translation handles $or cleanly)
    const user = await User.findOne({
      $or: [
        { phone: phoneOrEmail },
        { email: phoneOrEmail }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "No registered account found with this phone number or email" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated. Contact admin." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Save to user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send via email & SMS concurrently in the background (non-blocking)
    const sendOTPTasks = async () => {
      try {
        const promises = [
          sendRealTimeEmail(
            user.email,
            "CropAdvisor OTP Code",
            `Your verification code is: ${otp}. It is valid for 5 minutes.`
          )
        ];
        if (user.phone) {
          promises.push(
            sendRealTimeSMS(
              user.phone,
              `Your CropAdvisor verification OTP is: ${otp}. Valid for 5 minutes.`
            )
          );
        }
        await Promise.all(promises);
      } catch (err) {
        console.error("[OTP BACKGROUND SEND ERROR]", err);
      }
    };

    // Trigger asynchronously
    sendOTPTasks();

    res.json({ message: "OTP sent successfully to registered mobile and email", phone: user.phone });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

// ── @POST /api/auth/login-otp ────────────────────────────────────
const loginOTP = async (req, res) => {
  try {
    const { phoneOrEmail, otp } = req.body;
    if (!phoneOrEmail || !otp) {
      return res.status(400).json({ message: "Please provide phone number/email and OTP" });
    }

    // Find user by phone or email (MongooseCompat translation handles $or cleanly)
    const user = await User.findOne({
      $or: [
        { phone: phoneOrEmail },
        { email: phoneOrEmail }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated. Contact admin." });
    }

    // Verify OTP
    if (!user.otp || user.otp !== otp || new Date() > new Date(user.otpExpires)) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        state: user.state,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// ── @POST /api/auth/google-login ─────────────────────────────────
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Please provide Google ID token" });
    }

    // Verify token with Google's API using native fetch
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const payload = await response.json();
    const { sub: googleId, email, name } = payload;

    // Try to find the user by googleId
    let user = await User.findOne({ googleId });

    // If not found by googleId, try finding by email
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Link googleId to existing user
        user.googleId = googleId;
        await user.save();
      }
    }

    // If still not found, auto-register as a farmer
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10);
      user = await User.create({
        name: name || "Farmer",
        email: email,
        password: randomPassword,
        googleId: googleId,
        role: "farmer",
        district: "", // Leave blank so farmer is prompted to select it
        state: "",    // Leave blank so farmer is prompted to select it
        preferredLanguage: "English"
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated. Contact admin." });
    }

    res.json({
      message: "Google Login successful",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        state: user.state,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Google Login failed", error: error.message });
  }
};

module.exports = { register, login, getMe, changePassword, updateProfile, sendOTP, loginOTP, googleLogin };
