// Run this ONCE to populate crop database:
// node utils/seedCrops.js

const connectDB = require("../config/db");
const dotenv = require("dotenv");
dotenv.config();

const Crop = require("../models/Crop");

const crops = [
  { name: "Tomato", season: ["Kharif", "Rabi"], soilTypes: ["Red Soil", "Loamy Soil", "Black Soil"], waterNeed: "Medium", growingDurationDays: 90, expectedYieldPerAcre: "20-25 quintals", commonDiseases: ["Late Blight", "Early Blight", "Leaf Miner"], states: ["Tamil Nadu", "Karnataka", "AP", "Maharashtra"] },
  { name: "Rice", season: ["Kharif"], soilTypes: ["Alluvial Soil", "Loamy Soil", "Black Soil"], waterNeed: "High", growingDurationDays: 120, expectedYieldPerAcre: "20-30 quintals", commonDiseases: ["Blast", "Brown Spot", "Sheath Blight"], states: ["Tamil Nadu", "West Bengal", "Punjab", "UP"] },
  { name: "Wheat", season: ["Rabi"], soilTypes: ["Loamy Soil", "Alluvial Soil", "Black Soil"], waterNeed: "Medium", growingDurationDays: 120, expectedYieldPerAcre: "15-20 quintals", commonDiseases: ["Rust", "Smut", "Powdery Mildew"], states: ["Punjab", "Haryana", "UP", "MP"] },
  { name: "Cotton", season: ["Kharif"], soilTypes: ["Black Soil", "Alluvial Soil"], waterNeed: "Medium", growingDurationDays: 180, expectedYieldPerAcre: "8-12 quintals", commonDiseases: ["Bollworm", "Leaf Curl", "Wilt"], states: ["Gujarat", "Maharashtra", "AP", "Karnataka"] },
  { name: "Sugarcane", season: ["Zaid", "Kharif"], soilTypes: ["Loamy Soil", "Alluvial Soil", "Black Soil"], waterNeed: "High", growingDurationDays: 365, expectedYieldPerAcre: "300-400 quintals", commonDiseases: ["Red Rot", "Smut", "Ratoon Stunting"], states: ["UP", "Maharashtra", "Karnataka", "Tamil Nadu"] },
  { name: "Groundnut", season: ["Kharif", "Rabi"], soilTypes: ["Sandy Soil", "Loamy Soil", "Red Soil"], waterNeed: "Low", growingDurationDays: 120, expectedYieldPerAcre: "10-15 quintals", commonDiseases: ["Tikka", "Rust", "Stem Rot"], states: ["Gujarat", "AP", "Tamil Nadu", "Karnataka"] },
  { name: "Potato", season: ["Rabi"], soilTypes: ["Loamy Soil", "Alluvial Soil", "Sandy Soil"], waterNeed: "Medium", growingDurationDays: 90, expectedYieldPerAcre: "80-120 quintals", commonDiseases: ["Late Blight", "Early Blight", "Black Scurf"], states: ["UP", "West Bengal", "Bihar", "Punjab"] },
  { name: "Onion", season: ["Rabi", "Kharif"], soilTypes: ["Loamy Soil", "Red Soil", "Sandy Soil"], waterNeed: "Medium", growingDurationDays: 120, expectedYieldPerAcre: "80-100 quintals", commonDiseases: ["Purple Blotch", "Stemphylium Blight", "Thrips"], states: ["Maharashtra", "Karnataka", "MP", "Gujarat"] },
  { name: "Chilli", season: ["Kharif", "Rabi"], soilTypes: ["Red Soil", "Loamy Soil", "Black Soil"], waterNeed: "Medium", growingDurationDays: 150, expectedYieldPerAcre: "15-20 quintals", commonDiseases: ["Anthracnose", "Bacterial Wilt", "Mosaic Virus"], states: ["AP", "Karnataka", "Tamil Nadu", "Maharashtra"] },
  { name: "Maize", season: ["Kharif", "Rabi"], soilTypes: ["Loamy Soil", "Alluvial Soil", "Sandy Soil"], waterNeed: "Medium", growingDurationDays: 90, expectedYieldPerAcre: "25-35 quintals", commonDiseases: ["Common Rust", "Northern Leaf Blight", "Gray Leaf Spot"], states: ["Karnataka", "AP", "Tamil Nadu", "Maharashtra"] },
  { name: "Soybean", season: ["Kharif"], soilTypes: ["Black Soil", "Loamy Soil", "Alluvial Soil"], waterNeed: "Medium", growingDurationDays: 100, expectedYieldPerAcre: "10-15 quintals", commonDiseases: ["Rust", "Bacterial Pustule", "Mosaic"], states: ["MP", "Maharashtra", "Rajasthan", "Karnataka"] },
  { name: "Mustard", season: ["Rabi"], soilTypes: ["Loamy Soil", "Sandy Soil", "Alluvial Soil"], waterNeed: "Low", growingDurationDays: 90, expectedYieldPerAcre: "8-12 quintals", commonDiseases: ["White Rust", "Downy Mildew", "Sclerotinia"], states: ["Rajasthan", "UP", "Haryana", "MP"] },
  { name: "Sunflower", season: ["Rabi", "Zaid"], soilTypes: ["Loamy Soil", "Black Soil", "Alluvial Soil"], waterNeed: "Low", growingDurationDays: 90, expectedYieldPerAcre: "8-10 quintals", commonDiseases: ["Downy Mildew", "Rust", "Sclerotinia"], states: ["Karnataka", "AP", "Maharashtra", "Tamil Nadu"] },
  { name: "Banana", season: ["Kharif", "Rabi", "Zaid"], soilTypes: ["Loamy Soil", "Alluvial Soil", "Black Soil"], waterNeed: "High", growingDurationDays: 365, expectedYieldPerAcre: "200-300 quintals", commonDiseases: ["Panama Wilt", "Sigatoka", "Bunchy Top"], states: ["Tamil Nadu", "Maharashtra", "AP", "Karnataka"] },
  { name: "Turmeric", season: ["Kharif"], soilTypes: ["Red Soil", "Loamy Soil", "Laterite Soil"], waterNeed: "Medium", growingDurationDays: 270, expectedYieldPerAcre: "40-50 quintals", commonDiseases: ["Rhizome Rot", "Leaf Blotch", "Nematodes"], states: ["Andhra Pradesh", "Tamil Nadu", "Odisha", "Karnataka"] },
];

const seedCrops = async () => {
  try {
    await connectDB();
    console.log("Connected to Database");

    await Crop.deleteMany({});
    console.log("Cleared existing crops");

    await Crop.insertMany(crops);
    console.log(`✅ Successfully seeded ${crops.length} crops`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedCrops();
