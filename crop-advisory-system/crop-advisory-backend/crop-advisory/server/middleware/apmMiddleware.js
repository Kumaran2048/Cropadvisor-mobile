const apmStats = {
  totalRequests: 0,
  totalResponseTimeMs: 0,
  errorCount: 0,
  slowRequestsCount: 0,
  routeStats: {}, // { "GET /api/crop/all": { count: 1, totalTimeMs: 12.3 } }
};

const apmMiddleware = (req, res, next) => {
  const start = process.hrtime();
  apmStats.totalRequests++;

  res.on("finish", () => {
    const duration = process.hrtime(start);
    const durationInMs = parseFloat((duration[0] * 1000 + duration[1] / 1e6).toFixed(2));

    apmStats.totalResponseTimeMs += durationInMs;

    // Track status errors
    if (res.statusCode >= 400) {
      apmStats.errorCount++;
    }

    // Track slow requests (threshold 500ms)
    if (durationInMs > 500) {
      apmStats.slowRequestsCount++;
      console.warn(`[APM WARNING] SLOW ENDPOINT: ${req.method} ${req.originalUrl} took ${durationInMs}ms (Status: ${res.statusCode})`);
    } else {
      console.log(`[APM] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Time: ${durationInMs}ms`);
    }

    // Route-specific metrics (normalize route path)
    let path = req.originalUrl.split("?")[0]; // remove query string
    // Simple normalization: replace digits (like IDs) with :id
    const normalizedPath = path.replace(/\/\d+/g, "/:id");
    const routeKey = `${req.method} ${normalizedPath}`;
    
    if (!apmStats.routeStats[routeKey]) {
      apmStats.routeStats[routeKey] = { count: 0, totalTimeMs: 0 };
    }
    apmStats.routeStats[routeKey].count++;
    apmStats.routeStats[routeKey].totalTimeMs += durationInMs;
  });

  next();
};

const getApmStats = () => {
  const avgResponseTimeMs = apmStats.totalRequests > 0 
    ? parseFloat((apmStats.totalResponseTimeMs / apmStats.totalRequests).toFixed(2))
    : 0;

  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  const routes = Object.entries(apmStats.routeStats).map(([route, info]) => ({
    route,
    count: info.count,
    avgTimeMs: parseFloat((info.totalTimeMs / info.count).toFixed(2)),
  }));

  return {
    uptimeSeconds: Math.floor(uptime),
    totalRequests: apmStats.totalRequests,
    averageResponseTimeMs: avgResponseTimeMs,
    errorCount: apmStats.errorCount,
    slowRequestsCount: apmStats.slowRequestsCount,
    memoryUsage: {
      rssMb: parseFloat((memoryUsage.rss / 1024 / 1024).toFixed(2)),
      heapTotalMb: parseFloat((memoryUsage.heapTotal / 1024 / 1024).toFixed(2)),
      heapUsedMb: parseFloat((memoryUsage.heapUsed / 1024 / 1024).toFixed(2)),
    },
    routeMetrics: routes,
  };
};

module.exports = {
  apmMiddleware,
  getApmStats,
};
