const connectDB = require("./config/db");
const dotenv = require("dotenv");
const Crop = require("./models/Crop");
const GovernmentScheme = require("./models/GovernmentScheme");
const MarketPrice = require("./models/MarketPrice");

dotenv.config();

const seedExtraData = async () => {
  try {
    await connectDB();
    console.log("Database Connected for Seeding...");

    // 1. Update Crops with detailed guidance
    await Crop.updateMany({ name: "Tomato" }, {
      maintenanceTips: [
        "Maintain moderate soil moisture",
        "Prune lower leaves to prevent soil-borne diseases",
        "Stake plants for better support"
      ],
      fertilizerSchedule: [
        { day: 10, instruction: "Apply Phosphorus-rich starter fertilizer", fertilizerType: "NPK 10-20-10" },
        { day: 30, instruction: "Apply balanced fertilizer during vegetative growth", fertilizerType: "NPK 19-19-19" },
        { day: 50, instruction: "Apply Potassium-rich fertilizer for fruiting", fertilizerType: "NPK 13-0-45" }
      ],
      wateringSchedule: {
        frequency: "Daily",
        instructions: "Water at the base early morning. Avoid wetting leaves."
      },
      pestRisks: [
        { name: "Fruit Borer", prevention: "Spray Neem Oil every 15 days" },
        { name: "Early Blight", prevention: "Maintain spacing for airflow" }
      ],
      idealConditions: {
        tempRange: "20-30°C",
        humidityRange: "60-70%"
      },
      states: ["Tamil Nadu", "Karnataka", "Maharashtra", "Andhra Pradesh"]
    });

    // 2. Add Government Schemes
    await GovernmentScheme.deleteMany();
    await GovernmentScheme.insertMany([
      {
        title: "PM-Kisan Samman Nidhi",
        state: "Maharashtra",
        description: "Income support of ₹6,000 per year in three installments.",
        category: "Subsidy",
        eligibility: { landSizeMax: 5 },
        benefits: "₹6,000 directly to bank account",
        link: "https://pmkisan.gov.in/"
      },
      {
        title: "Tamil Nadu Horticulture Subsidy",
        state: "Tamil Nadu",
        description: "Subsidy for drip irrigation and greenhouse setup.",
        category: "Water Management",
        eligibility: { landSizeMax: 10, cropTypes: ["Tomato", "Chilli"] },
        benefits: "50-75% subsidy on equipment costs",
        link: "https://tnhorticulture.tn.gov.in/"
      },
      {
        title: "Raitha Vidya Nidhi",
        state: "Karnataka",
        description: "Scholarship for children of farmers.",
        category: "Other",
        benefits: "Educational support for farmer families",
        link: "https://ka.gov.in/"
      }
    ]);

    // 3. Add some recent market prices for trend analysis
    const today = new Date();
    const prices = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      prices.push({
        cropName: "Tomato",
        district: "Nashik",
        state: "Maharashtra",
        mandiName: "Nashik Mandi",
        minPrice: 1500 - (i * 10),
        maxPrice: 2200 - (i * 10),
        modalPrice: 2000 - (i * 10),
        date: d
      });
    }
    await MarketPrice.insertMany(prices);

    console.log("Extra Seed Data Inserted! ✅");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedExtraData();
