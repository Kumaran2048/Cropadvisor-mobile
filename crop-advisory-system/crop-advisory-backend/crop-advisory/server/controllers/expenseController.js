const Expense = require("../models/Expense");
const YieldLog = require("../models/YieldLog");

// ── @POST /api/expense ───────────────────────────────────────────
const addExpense = async (req, res) => {
  try {
    const { cropId, type, amount, description, date } = req.body;

    const expense = await Expense.create({
      farmerId: req.user._id,
      cropId,
      type,
      amount,
      description,
      date: date || Date.now(),
    });

    res.status(201).json({ message: "Expense added", expense });
  } catch (error) {
    res.status(500).json({ message: "Failed to add expense", error: error.message });
  }
};

// ── @GET /api/expense ────────────────────────────────────────────
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ farmerId: req.user._id })
      .populate("cropId", "name")
      .sort({ date: -1 });

    // Group by type for chart
    const grouped = expenses.reduce((acc, exp) => {
      acc[exp.type] = (acc[exp.type] || 0) + exp.amount;
      return acc;
    }, {});

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({ expenses, grouped, total });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses", error: error.message });
  }
};

// ── @DELETE /api/expense/:id ─────────────────────────────────────
const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete expense", error: error.message });
  }
};

// ── @POST /api/expense/yield ─────────────────────────────────────
const addYieldLog = async (req, res) => {
  try {
    const { cropId, season, year, quantityQuintals, sellingPricePerQuintal, notes } = req.body;

    // Calculate total expenses for this crop
    const expenses = await Expense.find({ farmerId: req.user._id, cropId });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const yieldLog = await YieldLog.create({
      farmerId: req.user._id,
      cropId,
      season,
      year,
      quantityQuintals,
      sellingPricePerQuintal,
      totalExpenses,
      notes,
    });

    res.status(201).json({
      message: "Yield logged successfully",
      yieldLog,
      summary: {
        totalRevenue: yieldLog.totalRevenue,
        totalExpenses: yieldLog.totalExpenses,
        netProfit: yieldLog.netProfit,
        status: yieldLog.netProfit >= 0 ? "Profit" : "Loss",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to log yield", error: error.message });
  }
};

// ── @GET /api/expense/summary ────────────────────────────────────
const getSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ farmerId: req.user._id });
    const yields = await YieldLog.find({ farmerId: req.user._id }).populate("cropId", "name");

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = yields.reduce((sum, y) => sum + (y.totalRevenue || 0), 0);

    res.json({
      totalExpenses,
      totalRevenue,
      netProfit: totalRevenue - totalExpenses,
      status: totalRevenue - totalExpenses >= 0 ? "Profit" : "Loss",
      yields,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get summary", error: error.message });
  }
};

module.exports = { addExpense, getExpenses, deleteExpense, addYieldLog, getSummary };
