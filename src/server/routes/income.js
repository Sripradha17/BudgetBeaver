import { Router } from "express";
import Income from "../models/Income.js";

const router = Router();

router.get("/", async (req, res) => {
  const income = await Income.find({ householdId: req.householdId }).sort({ date: -1 });
  res.json(income);
});

router.post("/", async (req, res) => {
  const { date, amount, person, note, foreignCurrency, foreignAmount } = req.body;
  const income = await Income.create({
    date,
    amount,
    person,
    note,
    foreignCurrency,
    foreignAmount,
    householdId: req.householdId,
  });
  res.status(201).json(income);
});

router.post("/bulk", async (req, res) => {
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "rows must be a non-empty array" });
  }
  const docs = rows.map(({ date, amount, person, note }) => ({
    date,
    amount,
    person,
    note,
    householdId: req.householdId,
  }));
  const created = await Income.insertMany(docs);
  res.status(201).json(created);
});

router.put("/:id", async (req, res) => {
  const { date, amount, person, note, foreignCurrency, foreignAmount } = req.body;
  const update = {};
  if (date !== undefined) update.date = date;
  if (amount !== undefined) update.amount = amount;
  if (person !== undefined) update.person = person;
  if (note !== undefined) update.note = note;
  if (foreignCurrency !== undefined) update.foreignCurrency = foreignCurrency;
  if (foreignAmount !== undefined) update.foreignAmount = foreignAmount;
  const income = await Income.findOneAndUpdate(
    { _id: req.params.id, householdId: req.householdId },
    update,
    { new: true }
  );
  if (!income) return res.status(404).json({ error: "Income not found" });
  res.json(income);
});

router.delete("/:id", async (req, res) => {
  await Income.findOneAndDelete({ _id: req.params.id, householdId: req.householdId });
  res.status(204).end();
});

export default router;
