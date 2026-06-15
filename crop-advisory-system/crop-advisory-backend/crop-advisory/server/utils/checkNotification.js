require("dotenv").config({ path: "../.env" });
const { sendRealTimeEmail, sendRealTimeSMS } = require("./notificationService");

async function runCheck() {
  console.log("🚀 Testing CropAdvisor notificationService...");
  
  // Test Email
  console.log("\n--- Testing Email ---");
  const emailRes = await sendRealTimeEmail(
    "farmer@demo.com",
    "🧪 Test Notification System",
    "Hello! This is a real-time verification test from the CropAdvisor setup."
  );
  console.log("Email Result:", emailRes);

  // Test SMS
  console.log("\n--- Testing SMS ---");
  const smsRes = await sendRealTimeSMS(
    "9876543210",
    "CropAdvisor test message: Verification is successful!"
  );
  console.log("SMS Result:", smsRes);

  console.log("\n✅ Verification check complete!");
}

runCheck();
