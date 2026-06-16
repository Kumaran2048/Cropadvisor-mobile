# 🧪 Crop Advisory System — Test Suite & Performance telemetry

This folder contains a built-in, lightweight, zero-dependency testing harness for both **API correctness validation** and **Application Performance Monitoring (APM) load testing**.

---

## 🛠️ Setup & Prerequisites

All test scripts execute directly in pure Node.js against the MySQL database. Make sure that your backend `.env` variables (e.g. database credentials, JWT secret keys, etc.) are correctly set. 

You do **not** need to manually start the backend server before running the tests. The scripts will automatically check if the server is already running on port `5000` (and use it), or spin up a test instance programmatically on port `5001`.

---

## 📂 Test Suites

### 1. API Integration Tests (`api-integration.test.js`)
This suite validates the complete operational flow of the application APIs, performing tests on:
- **Authentication**: User registration, email/SMS welcome triggering, token-based authentication, retrieving profile `/me`, profile modification, and changing passwords.
- **Farm Profile Management**: Profile creation, coordinate geolocations, water sources, and selection of active crops.
- **Agricultural Decision Support**: Expected yield calculation and what-if financial profit simulation.
- **Core Advisory Routing**: Listing crop recommendations, daily tasks, crop insights, government schemes, and weather alerts.
- **Expense Bookkeeping**: Submitting expenses, recording yield outputs, downloading aggregate reports, and test record cleanup.
- **External Services**: Verifying OpenWeather logs, Agmarknet live market pricing, and Python Flask ML prediction endpoints.

> [!NOTE]
> **Database Safety:** The integration test suite creates a temporary farmer user (`test_farmer_<timestamp>@example.com`). At the end of the test run, a teardown function triggers database queries that clean up this user and all associated records, keeping your primary database clutter-free.

### 2. APM Performance Load Tests (`apm-performance.test.js`)
This script simulates concurrent API requests on critical system endpoints under load.
- Simulates concurrent workers hammering endpoints.
- Targets health checks, APM stats, and password-hashing login routes (CPU-intensive task).
- Returns throughput metrics (Requests per Second, RPS), latency percentiles (average, maximum, P95), success rate, and memory footprints.

---

## 🚀 How to Run the Tests

From the server root directory, execute:

### Run All Tests (API + Performance)
```bash
npm run test
```

### Run Only API Integration Tests
```bash
npm run test:api
```

### Run Only APM Performance Load Tests
```bash
npm run test:perf
```

---

## 📈 APM Telemetry stats

To view live server performance metrics and average latency times, navigate to the following endpoint in your browser or Postman:

```
GET http://localhost:5000/api/apm/stats
```

The response will look like:
```json
{
  "status": "Healthy",
  "api": "Crop Advisory API ✅",
  "timestamp": "2026-06-16T11:22:15.123Z",
  "apm": {
    "uptimeSeconds": 124,
    "totalRequests": 12,
    "averageResponseTimeMs": 24.5,
    "errorCount": 0,
    "slowRequestsCount": 0,
    "memoryUsage": {
      "rssMb": 42.1,
      "heapTotalMb": 18.5,
      "heapUsedMb": 12.8
    },
    "routeMetrics": [
      { "route": "GET /", "count": 2, "avgTimeMs": 1.2 },
      { "route": "POST /api/auth/login", "count": 5, "avgTimeMs": 85.3 }
    ]
  }
}
```
> [!TIP]
> If an endpoint takes longer than **500ms**, the server logs a warning: `[APM WARNING] SLOW ENDPOINT: ...` directly in the terminal, helping developers isolate bottleneck queries or third-party service delay.
