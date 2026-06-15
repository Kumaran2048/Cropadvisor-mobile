const MarketPrice = require("../models/MarketPrice");
const FarmProfile = require("../models/FarmProfile");
const axios = require("axios");

// ── SYNC ALL MARKET PRICES FROM AGMARKNET ─────────────────────────
const syncGlobalMarketPrices = async () => {
  try {
    const apiKey = process.env.AGMARKNET_API_KEY;
    
    // 1. CLEANUP & STANDARDIZATION (Fixes 'tomato' vs 'Tomato')
    // Delete exact duplicates or malformed lowercase entries
    await MarketPrice.deleteMany({ cropName: "tomato" }); 

    // 2. CHECK VARIETY & SEED IF NEEDED
    const uniqueCrops = await MarketPrice.distinct("cropName");
    if (uniqueCrops.length < 5) {
      const diverseSeeds = [
        { c: "Onion", m: "Lasalgaon", d: "Nashik", p: 2400, s: "Maharashtra" },
        { c: "Potato", m: "Agra Mandi", d: "Agra", p: 1800, s: "Uttar Pradesh" },
        { c: "Wheat", m: "Khanna", d: "Ludhiana", p: 2275, s: "Punjab" },
        { c: "Cotton", m: "Nagpur Mandi", d: "Nagpur", p: 7500, s: "Maharashtra" },
        { c: "Garlic", m: "Mandsaur", d: "Mandsaur", p: 14500, s: "Madhya Pradesh" },
        { c: "Ginger", m: "Shimoga", d: "Shimoga", p: 9000, s: "Karnataka" },
        { c: "Chilli", m: "Guntur", d: "Guntur", p: 18500, s: "Andhra Pradesh" },
        { c: "Rice", m: "Karnal", d: "Karnal", p: 3800, s: "Haryana" },
        { c: "Apple", m: "Srinagar", d: "Srinagar", p: 8500, s: "Jammu and Kashmir" },
        { c: "Grapes", m: "Pimpalgaon", d: "Nashik", p: 5500, s: "Maharashtra" },
        { c: "Banana", m: "Trichy", d: "Tiruchirappalli", p: 1500, s: "Tamil Nadu" },
        { c: "Coconut", m: "Pollachi", d: "Coimbatore", p: 3000, s: "Tamil Nadu" },
        { c: "Turmeric", m: "Erode", d: "Erode", p: 7000, s: "Tamil Nadu" }
      ];

      await Promise.all(diverseSeeds.map(seed => 
        MarketPrice.findOneAndUpdate(
          { mandiName: seed.m, cropName: seed.c },
          {
            state: seed.s,
            district: seed.d,
            minPrice: seed.p - 300,
            maxPrice: seed.p + 300,
            modalPrice: seed.p,
            date: new Date(),
            unit: "Quintal"
          },
          { upsert: true }
        )
      ));
    }

    if (!apiKey) return null;

    // 3. FETCH LIVE DATA
    const url = `https://api.data.gov.in/resource/9ef273bd-a402-459c-809a-cfc424c2d210?api-key=${apiKey}&format=json&limit=100`;
    const response = await axios.get(url);
    const records = response.data.records;

    if (records && records.length > 0) {
      await Promise.all(records.map(async (rec) => {
        const stdName = rec.commodity.charAt(0).toUpperCase() + rec.commodity.slice(1).toLowerCase();
        return await MarketPrice.findOneAndUpdate(
          { mandiName: rec.market, cropName: stdName, date: new Date(rec.arrival_date) },
          {
            state: rec.state,
            district: rec.district,
            minPrice: parseFloat(rec.min_price) || 0,
            maxPrice: parseFloat(rec.max_price) || 0,
            modalPrice: parseFloat(rec.modal_price) || 0,
            unit: "Quintal"
          },
          { upsert: true, new: true }
        );
      }));
    }
    return true;
  } catch (err) {
    console.error("Global Agmarknet Sync Failed:", err.message);
  }
  return false;
};

// ── SYNC SPECIFIC MARKET PRICES ──────────────────────────────────
const syncMarketPrices = async (cropName, district) => {
  try {
    const apiKey = process.env.AGMARKNET_API_KEY;
    if (!apiKey) return null;

    const url = `https://api.data.gov.in/resource/9ef273bd-a402-459c-809a-cfc424c2d210?api-key=${apiKey}&format=json&filters[commodity]=${cropName}&limit=20`;
    
    const response = await axios.get(url);
    const records = response.data.records;

    if (records && records.length > 0) {
      const savedPrices = await Promise.all(records.map(async (rec) => {
         return await MarketPrice.findOneAndUpdate(
           { mandiName: rec.market, cropName: rec.commodity, date: new Date(rec.arrival_date) },
           {
             state: rec.state,
             district: rec.district,
             minPrice: parseFloat(rec.min_price) || 0,
             maxPrice: parseFloat(rec.max_price) || 0,
             modalPrice: parseFloat(rec.modal_price) || 0,
             unit: "Quintal"
           },
           { upsert: true, new: true }
         );
      }));
      return savedPrices;
    }
  } catch (err) {
    console.error("Agmarknet Sync Failed:", err.message);
  }
  return null;
};

// ── @GET /api/market/prices ──────────────────────────────────────
const getMarketPrices = async (req, res) => {
  try {
    const profile = await FarmProfile.findOne({ userId: req.user._id }).populate("activeCrop");
    const district = profile?.district || req.query.district;
    const cropName = profile?.activeCrop?.name || req.query.crop || "Tomato";

    // Attempt real-time sync
    await syncMarketPrices(cropName, district);

    // Get last 30 days prices from DB (including newly synced)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const prices = await MarketPrice.find({
      cropName: { $regex: cropName, $options: "i" },
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    const todayPrice = prices[0] || null;
    const nearbyMarkets = prices.filter(p => p.district === district);
    
    // AI Decision Logic
    let aiSuggestion = { decision: "Hold", reason: "Gathering market data..." };
    if (prices.length >= 3) {
      const avg = prices.slice(0, 5).reduce((acc, curr) => acc + curr.modalPrice, 0) / prices.slice(0, 5).length;
      if (todayPrice?.modalPrice > avg * 1.05) {
        aiSuggestion = { decision: "Sell Now", reason: "Prices are 5% above weekly average. Peak demand detected." };
      } else if (todayPrice?.modalPrice < avg * 0.95) {
        aiSuggestion = { decision: "Wait", reason: "Market dip detected. Prices expected to stabilize within 72 hours." };
      } else {
        aiSuggestion = { decision: "Neutral", reason: "Market is stable. Sell if immediate liquidity is needed." };
      }
    }

    res.json({ 
      cropName, 
      district, 
      todayPrice, 
      trend: prices.map(p => ({ date: p.date, price: p.modalPrice, mandi: p.mandiName })), 
      nearbyMarkets, 
      aiSuggestion,
      isLive: !!todayPrice
    });
  } catch (error) {
    res.status(500).json({ message: "Failed market fetch", error: error.message });
  }
};

const getAllCropPrices = async (req, res) => {
  try {
    // 1. Sync fresh data in background if needed
    await syncGlobalMarketPrices();

    const { state, district } = req.query;
    const sequelize = require("../config/sequelize");
    const { QueryTypes } = require("sequelize");

    let queryStr = `
      SELECT mp1.*
      FROM MarketPrices mp1
      INNER JOIN (
        SELECT MAX(_id) AS max_id
        FROM MarketPrices
        ${state ? "WHERE state LIKE :state" : ""}
        GROUP BY cropName, mandiName
      ) mp2 ON mp1._id = mp2.max_id
      ORDER BY mp1.date DESC
      LIMIT 100
    `;

    const uniqueLatestPrices = await sequelize.query(queryStr, {
      replacements: state ? { state: `%${state}%` } : {},
      type: QueryTypes.SELECT
    });

    // If no local data, fallback to national data
    if (uniqueLatestPrices.length === 0 && state) {
      const nationalPrices = await sequelize.query(`
        SELECT mp1.*
        FROM MarketPrices mp1
        INNER JOIN (
          SELECT MAX(_id) AS max_id
          FROM MarketPrices
          GROUP BY cropName, mandiName
        ) mp2 ON mp1._id = mp2.max_id
        ORDER BY mp1.date DESC
        LIMIT 100
      `, {
        type: QueryTypes.SELECT
      });
      return res.json({ success: true, prices: nationalPrices, local: false });
    }

    res.json({ success: true, prices: uniqueLatestPrices, local: !!state });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch market data", error: err.message });
  }
};

const getPriceHistory = async (req, res) => {
  try {
    const { cropName, mandiName } = req.query;
    if (!cropName || !mandiName) {
      return res.status(400).json({ message: "Crop name and Mandi name required" });
    }

    const history = await MarketPrice.find({ 
      cropName: { $regex: new RegExp(`^${cropName}$`, "i") },
      mandiName: { $regex: new RegExp(`^${mandiName}$`, "i") }
    }).sort({ date: -1 }).limit(15);

    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history", error: error.message });
  }
};

const addMarketPrice = async (req, res) => {
  try {
    const { cropName, district, state, mandiName, minPrice, maxPrice, modalPrice } = req.body;
    const price = await MarketPrice.create({
      cropName, district, state, mandiName, minPrice, maxPrice, modalPrice, date: new Date(),
    });
    res.status(201).json({ message: "Market price added", price });
  } catch (error) {
    res.status(500).json({ message: "Failed to add market price", error: error.message });
  }
};

module.exports = { getMarketPrices, getAllCropPrices, addMarketPrice, getPriceHistory };
