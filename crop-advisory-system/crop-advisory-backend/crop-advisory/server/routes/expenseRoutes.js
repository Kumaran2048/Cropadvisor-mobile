const express = require("express");
const router = express.Router();
const { addExpense, getExpenses, deleteExpense, addYieldLog, getSummary } = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/", protect, authorize("farmer"), addExpense);
router.get("/", protect, authorize("farmer"), getExpenses);
router.delete("/:id", protect, authorize("farmer"), deleteExpense);
router.post("/yield", protect, authorize("farmer"), addYieldLog);
router.get("/summary", protect, authorize("farmer"), getSummary);

module.exports = router;
