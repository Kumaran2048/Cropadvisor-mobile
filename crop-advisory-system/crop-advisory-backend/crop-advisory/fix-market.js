const connectDB = require('./server/config/db');
const MarketPrice = require('./server/models/MarketPrice');

(async () => {
  await connectDB();
  console.log("Connected. Clearing old dummy data...");
  await MarketPrice.deleteMany({});
  console.log("Cleared. The backend will re-seed on next request.");
  process.exit(0);
})();
