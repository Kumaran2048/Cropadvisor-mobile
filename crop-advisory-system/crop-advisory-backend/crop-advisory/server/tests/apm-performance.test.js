const http = require("http");

// Configuration
let PORT = process.env.PORT || 5000;
const CONCURRENCY = 15; // Number of simultaneous connections
const DURATION_MS = 5000; // Duration of load test in ms

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

// Target endpoints for the load test
const targets = [
  { method: "GET", path: "/" },
  { method: "GET", path: "/api/apm/stats" },
  { method: "POST", path: "/api/auth/login", body: { email: "nonexistent_stress@example.com", password: "wrong" } }
];

const stats = {
  totalRequests: 0,
  successful: 0,
  failed: 0,
  latencies: [],
};

function performRequest(target) {
  const start = process.hrtime();
  const data = target.body ? JSON.stringify(target.body) : "";
  
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: PORT,
      path: target.path,
      method: target.method,
      headers: {
        "Content-Type": "application/json"
      }
    };
    
    if (target.body) {
      options.headers["Content-Length"] = Buffer.byteLength(data);
    }
    
    const req = http.request(options, (res) => {
      res.on("data", () => {}); // Consume stream
      res.on("end", () => {
        const diff = process.hrtime(start);
        const timeMs = diff[0] * 1000 + diff[1] / 1e6;
        
        stats.totalRequests++;
        // Login with wrong credentials returns 401, which is expected/successful for this stress test
        if (res.statusCode < 500) {
          stats.successful++;
        } else {
          stats.failed++;
        }
        stats.latencies.push(timeMs);
        resolve();
      });
    });
    
    req.on("error", () => {
      stats.totalRequests++;
      stats.failed++;
      resolve();
    });
    
    if (target.body) {
      req.write(data);
    }
    req.end();
  });
}

// Check if server is running on 5000; if not, spin it up on 5001
async function ensureServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}/`, (res) => {
      resolve(true);
    });
    req.on("error", () => {
      console.log(`${colors.yellow}[INFO] Server offline on port 5000. Spinning up programmatically on port 5001...${colors.reset}`);
      PORT = 5001;
      process.env.PORT = 5001;
      
      try {
        require("../index.js");
        setTimeout(() => resolve(true), 1500);
      } catch (err) {
        console.error(`${colors.red}[ERROR] Failed to start server:${colors.reset}`, err);
        process.exit(1);
      }
    });
  });
}

async function runWorker(endTime) {
  while (Date.now() < endTime) {
    // Pick random target
    const target = targets[Math.floor(Math.random() * targets.length)];
    await performRequest(target);
  }
}

async function runLoadTest() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}     CROP ADVISORY SYSTEM - APM & PERFORMANCE TEST   ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);
  
  await ensureServerRunning();
  
  console.log(`${colors.cyan}[INFO] Starting Load Simulation...${colors.reset}`);
  console.log(`       - Target Port: ${PORT}`);
  console.log(`       - Concurrency: ${CONCURRENCY} parallel workers`);
  console.log(`       - Duration:    ${DURATION_MS / 1000} seconds`);
  console.log(`       - Endpoints:   ${targets.map(t => `${t.method} ${t.path}`).join(", ")}`);
  console.log(`\n${colors.yellow}Running stress test, please wait...${colors.reset}`);
  
  const startTime = Date.now();
  const endTime = startTime + DURATION_MS;
  
  // Launch concurrent workers
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(runWorker(endTime));
  }
  
  await Promise.all(workers);
  
  const actualDurationMs = Date.now() - startTime;
  const actualDurationSeconds = actualDurationMs / 1000;
  
  // Calculate results
  const rps = (stats.totalRequests / actualDurationSeconds).toFixed(2);
  const successRate = stats.totalRequests > 0 
    ? ((stats.successful / stats.totalRequests) * 100).toFixed(2)
    : "0.00";
    
  stats.latencies.sort((a, b) => a - b);
  const minLatency = stats.latencies.length > 0 ? stats.latencies[0].toFixed(2) : "0.00";
  const maxLatency = stats.latencies.length > 0 ? stats.latencies[stats.latencies.length - 1].toFixed(2) : "0.00";
  
  const sumLatency = stats.latencies.reduce((sum, val) => sum + val, 0);
  const avgLatency = stats.latencies.length > 0 ? (sumLatency / stats.latencies.length).toFixed(2) : "0.00";
  
  const p95Index = Math.floor(stats.latencies.length * 0.95);
  const p95Latency = stats.latencies.length > 0 ? stats.latencies[p95Index].toFixed(2) : "0.00";

  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}               PERFORMANCE METRICS RESULT           ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(` Total Requests Sent:   ${stats.totalRequests}`);
  console.log(` Success Rate:          ${colors.green}${successRate}% (${stats.successful} reqs)${colors.reset}`);
  console.log(` Failed Requests:       ${stats.failed > 0 ? colors.red : colors.green}${stats.failed}${colors.reset}`);
  console.log(` Request Throughput:    ${colors.bold}${colors.yellow}${rps} req/sec${colors.reset}`);
  console.log(` Minimum Latency:       ${minLatency} ms`);
  console.log(` Average Latency:       ${avgLatency} ms`);
  console.log(` 95th Percentile (P95): ${p95Latency} ms`);
  console.log(` Maximum Latency:       ${maxLatency} ms`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  // Log final APM health endpoint telemetry
  try {
    const finalRes = await new Promise((resolve) => {
      http.get(`http://localhost:${PORT}/api/apm/stats`, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch(e) {
            resolve(null);
          }
        });
      }).on("error", () => resolve(null));
    });

    if (finalRes && finalRes.apm) {
      console.log(`${colors.cyan}[APM Telemetry Dashboard from Server]${colors.reset}`);
      console.log(` Server Uptime:       ${finalRes.apm.uptimeSeconds} seconds`);
      console.log(` Memory Footprint rss: ${finalRes.apm.memoryUsage.rssMb} MB`);
      console.log(` Total Server Requests:${finalRes.apm.totalRequests}`);
      console.log(` Average Response Time:${finalRes.apm.averageResponseTimeMs} ms`);
      console.log(` Slow Requests Count:  ${finalRes.apm.slowRequestsCount}`);
      console.log(` Route breakdown:`);
      finalRes.apm.routeMetrics.forEach(m => {
        console.log(`   - ${m.route}: ${m.count} hits, avg ${m.avgTimeMs}ms`);
      });
      console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);
    }
  } catch(e) {}

  process.exit(stats.failed > stats.totalRequests * 0.1 ? 1 : 0);
}

runLoadTest().catch((err) => {
  console.error("Stress test crashed:", err);
  process.exit(1);
});
