const http = require("http");
const assert = require("assert");
const path = require("path");

// Configuration
let PORT = process.env.PORT || 5000;
const TEST_EMAIL = `test_farmer_${Date.now()}@example.com`;
const TEST_PASSWORD = "Password123!";
let authToken = "";
let testUser = null;
let testCrop = null;

// ANSI colors for beautiful terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

// Custom http request helper using native http module (to ensure maximum compatibility)
function apiRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : "";
    const options = {
      hostname: "localhost",
      port: PORT,
      path: endpoint,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (body) {
      options.headers["Content-Length"] = Buffer.byteLength(data);
    }
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let resData = "";
      res.on("data", (chunk) => {
        resData += chunk;
      });
      res.on("end", () => {
        let parsed = resData;
        if (res.headers["content-type"] && res.headers["content-type"].includes("application/json")) {
          try {
            parsed = JSON.parse(resData);
          } catch (e) {
            // response was not JSON
          }
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(data);
    }
    req.end();
  });
}

// Check if server is running on 5000; if not, spin it up on 5001
async function ensureServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}/`, (res) => {
      console.log(`${colors.cyan}[INFO] Connected to active server on port ${PORT}.${colors.reset}`);
      resolve(true);
    });
    req.on("error", () => {
      console.log(`${colors.yellow}[INFO] No running server found on port 5000. Spinning up test server on port 5001...${colors.reset}`);
      PORT = 5001;
      process.env.PORT = 5001;
      
      // Require the server file to start it programmatically
      try {
        require("../index.js");
        // Wait 1.5s for DB and Express to start
        setTimeout(() => {
          resolve(true);
        }, 1500);
      } catch (err) {
        console.error(`${colors.red}[ERROR] Failed to start local server programmatically:${colors.reset}`, err);
        process.exit(1);
      }
    });
  });
}

// DB Clean up directly using Sequelize models
async function performCleanup() {
  console.log(`\n${colors.cyan}🧹 Starting database cleanup for test records...${colors.reset}`);
  try {
    const User = require("../models/User");
    const FarmProfile = require("../models/FarmProfile");
    const Expense = require("../models/Expense");
    const YieldLog = require("../models/YieldLog");
    const DailyTask = require("../models/DailyTask");

    if (testUser && testUser._id) {
      const userId = testUser._id;
      
      const deletedFarms = await FarmProfile.deleteMany({ userId });
      console.log(`   - Deleted ${deletedFarms} test farm profiles`);
      
      const deletedExpenses = await Expense.deleteMany({ farmerId: userId });
      console.log(`   - Deleted ${deletedExpenses} test expenses`);
      
      const deletedYields = await YieldLog.deleteMany({ farmerId: userId });
      console.log(`   - Deleted ${deletedYields} test yield logs`);
      
      const deletedTasks = await DailyTask.deleteMany({ userId });
      console.log(`   - Deleted ${deletedTasks} test daily tasks`);
      
      await User.destroy({ where: { _id: userId } });
      console.log(`   - Deleted test user: ${TEST_EMAIL}`);
    }
    console.log(`${colors.green}✅ Database cleanup complete!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.yellow}⚠️ Cleanup Warning (might be fine if tables are empty): ${error.message}${colors.reset}`);
  }
}

// Running Test Harness
const testResults = [];
async function runTest(testName, testFn) {
  process.stdout.write(` Running: ${testName} ...`);
  try {
    await testFn();
    console.log(`\r ${colors.green}✓ Passed:${colors.reset} ${testName}`);
    testResults.push({ name: testName, status: "passed" });
  } catch (error) {
    console.log(`\r ${colors.red}✗ Failed:${colors.reset} ${testName}`);
    console.error(`   ${colors.red}Error:${colors.reset}`, error.message);
    if (error.actual !== undefined && error.expected !== undefined) {
      console.error(`   Expected: ${error.expected}, Got: ${error.actual}`);
    }
    testResults.push({ name: testName, status: "failed", error: error.message });
  }
}

// Test Suite Definition
async function runAllTests() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}     CROP ADVISORY SYSTEM - API INTEGRATION TESTS    ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  await ensureServerRunning();

  // Test 1: Health check
  await runTest("GET / (Health Check)", async () => {
    const res = await apiRequest("GET", "/");
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.message.includes("running"));
  });

  // Test 2: APM Stats Endpoint
  await runTest("GET /api/apm/stats", async () => {
    const res = await apiRequest("GET", "/api/apm/stats");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, "Healthy");
    assert.ok(res.body.apm.totalRequests > 0);
  });

  // Test 3: Register User
  await runTest("POST /api/auth/register", async () => {
    const registerData = {
      name: "Integration Test Farmer",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      role: "farmer",
      district: "Coimbatore",
      state: "Tamil Nadu",
    };
    const res = await apiRequest("POST", "/api/auth/register", registerData);
    assert.ok(res.statusCode === 201 || res.statusCode === 210);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, TEST_EMAIL);
    authToken = res.body.token;
    testUser = res.body.user;
  });

  // Test 4: Login User
  await runTest("POST /api/auth/login", async () => {
    const loginData = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    };
    const res = await apiRequest("POST", "/api/auth/login", loginData);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.token);
    authToken = res.body.token; // Refresh token
  });

  // Test 5: Get Profile Details (/api/auth/me)
  await runTest("GET /api/auth/me", async () => {
    const res = await apiRequest("GET", "/api/auth/me", null, authToken);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.user.email, TEST_EMAIL);
  });

  // Test 6: Update Profile
  await runTest("PUT /api/auth/profile", async () => {
    const updateData = {
      name: "Test Farmer Active",
      phone: testUser ? testUser.phone : "+19876543210",
      district: "Coimbatore",
      state: "Tamil Nadu",
    };
    const res = await apiRequest("PUT", "/api/auth/profile", updateData, authToken);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.user.name, "Test Farmer Active");
  });

  // Test 7: Create Farm Profile
  await runTest("POST /api/farm/profile", async () => {
    const farmData = {
      landSize: 4.5,
      soilType: "Loamy Soil",
      waterSource: "Well",
      village: "Integrate Fields",
      district: "Coimbatore",
      state: "Tamil Nadu",
      latitude: 11.0168,
      longitude: 76.9558,
    };
    const res = await apiRequest("POST", "/api/farm/profile", farmData, authToken);
    assert.ok(res.statusCode === 200 || res.statusCode === 201);
    assert.strictEqual(parseFloat(res.body.profile.landSize), 4.5);
  });

  // Test 8: Get Farm Profile
  await runTest("GET /api/farm/profile", async () => {
    const res = await apiRequest("GET", "/api/farm/profile", null, authToken);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.profile.village, "Integrate Fields");
  });

  // Test 9: Get Crop Recommendations
  await runTest("GET /api/crop/recommend", async () => {
    const res = await apiRequest("GET", "/api/crop/recommend", null, authToken);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.recommendedCrops));
  });

  // Test 10: Select Active Crop
  await runTest("PUT /api/farm/select-crop", async () => {
    const selectData = { cropId: "Rice" };
    const res = await apiRequest("PUT", "/api/farm/select-crop", selectData, authToken);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.profile.activeCropId);
    testCrop = res.body.profile.activeCrop;
  });

  // Test 11: Predict Profit (What-if Simulation)
  await runTest("POST /api/farm/predict-profit", async () => {
    const predictData = {
      cropId: testCrop ? testCrop._id : 1,
      landSize: 2,
    };
    const res = await apiRequest("POST", "/api/farm/predict-profit", predictData, authToken);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.expectedProfit !== undefined);
  });

  // Test 12: List All Crops
  await runTest("GET /api/crop/all", async () => {
    const res = await apiRequest("GET", "/api/crop/all", null, authToken);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.crops));
  });

  // Test 13: Daily Tasks
  await runTest("GET /api/tasks", async () => {
    const res = await apiRequest("GET", "/api/tasks", null, authToken);
    assert.strictEqual(res.statusCode, 200);
  });

  // Test 14: Government Schemes
  await runTest("GET /api/schemes", async () => {
    const res = await apiRequest("GET", "/api/schemes", null, authToken);
    assert.strictEqual(res.statusCode, 200);
  });

  // Test 15: Alerts
  await runTest("GET /api/alert/my-alerts", async () => {
    const res = await apiRequest("GET", "/api/alert/my-alerts", null, authToken);
    assert.strictEqual(res.statusCode, 200);
  });

  // Test 16: Insights
  await runTest("GET /api/insights/seasonal", async () => {
    const res = await apiRequest("GET", "/api/insights/seasonal", null, authToken);
    assert.strictEqual(res.statusCode, 200);
  });

  // Test 17: Log Expense
  let testExpenseId = "";
  await runTest("POST /api/expense", async () => {
    const expenseData = {
      cropId: testCrop ? testCrop._id : 1,
      amount: 1200,
      type: "Fertilizer",
      description: "Organic manure check",
      date: new Date(),
    };
    const res = await apiRequest("POST", "/api/expense", expenseData, authToken);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.expense.amount, 1200);
    testExpenseId = res.body.expense._id;
  });

  // Test 18: Get Expenses
  await runTest("GET /api/expense", async () => {
    const res = await apiRequest("GET", "/api/expense", null, authToken);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.expenses));
  });

  // Test 19: Add Yield Log
  await runTest("POST /api/expense/yield", async () => {
    const yieldData = {
      cropId: testCrop ? testCrop._id : 1,
      season: "Kharif",
      year: new Date().getFullYear(),
      quantityQuintals: 15,
      sellingPricePerQuintal: 2500,
      notes: "First harvest yield",
    };
    const res = await apiRequest("POST", "/api/expense/yield", yieldData, authToken);
    assert.strictEqual(res.statusCode, 201);
  });

  // Test 20: Get Expense/Yield Summary
  await runTest("GET /api/expense/summary", async () => {
    const res = await apiRequest("GET", "/api/expense/summary", null, authToken);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.totalExpenses !== undefined);
  });

  // Test 21: Delete Expense
  await runTest("DELETE /api/expense/:id", async () => {
    if (testExpenseId) {
      const res = await apiRequest("DELETE", `/api/expense/${testExpenseId}`, null, authToken);
      assert.strictEqual(res.statusCode, 200);
    } else {
      assert.fail("No expense ID to delete");
    }
  });

  // Test 22: Weather API Integration
  await runTest("GET /api/weather/current", async () => {
    const res = await apiRequest("GET", "/api/weather/current", null, authToken);
    assert.strictEqual(res.statusCode, 200);
  });

  // Test 23: Agmarknet Market Prices
  await runTest("GET /api/market/prices", async () => {
    const res = await apiRequest("GET", "/api/market/prices", null, authToken);
    assert.strictEqual(res.statusCode, 200);
  });

  // Test 24: ML Predict Crops (Local or Flask)
  await runTest("POST /api/ml/recommend-crop", async () => {
    const mlData = {
      n: 90, p: 42, k: 43,
      temperature: 20.8,
      humidity: 82.0,
      ph: 6.5,
      rainfall: 202.9,
    };
    const res = await apiRequest("POST", "/api/ml/recommend-crop", mlData, authToken);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.recommendedCrop);
  });

  // Test 25: ML Predict Fertilizer (Local or Flask)
  await runTest("POST /api/ml/predict-fertilizer", async () => {
    const mlData = {
      temperature: 26,
      humidity: 52,
      moisture: 38,
      soilType: "Sandy",
      cropType: "Maize",
      n: 37, k: 0, p: 0,
    };
    const res = await apiRequest("POST", "/api/ml/predict-fertilizer", mlData, authToken);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.recommendedFertilizer);
  });

  // Clean up
  await performCleanup();

  // Print Summary
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}                 TEST RUN SUMMARY                    ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  
  const passed = testResults.filter(t => t.status === "passed").length;
  const failed = testResults.filter(t => t.status === "failed").length;
  
  console.log(` Total Tests Run: ${testResults.length}`);
  console.log(` Passed:         ${colors.green}${passed}${colors.reset}`);
  console.log(` Failed:         ${failed > 0 ? colors.red : colors.green}${failed}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error("Test suite execution crashed:", err);
  performCleanup().finally(() => process.exit(1));
});
