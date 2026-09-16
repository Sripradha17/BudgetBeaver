import { Router } from "express";
import Goal from "../models/Goal.js";

const router = Router();

router.get("/", async (req, res) => {
  const goals = await Goal.find({ householdId: req.householdId }).sort({ createdAt: -1 });
  res.json(goals);
});

router.post("/", async (req, res) => {
  const { name, targetAmount, targetDate, linkedCategoryId, startDate } = req.body;
  const goal = await Goal.create({
    name,
    targetAmount,
    targetDate,
    linkedCategoryId: linkedCategoryId || null,
    startDate,
    householdId: req.householdId,
  });
  res.status(201).json(goal);
});

router.put("/:id", async (req, res) => {
  const { name, targetAmount, targetDate, linkedCategoryId, manualProgress, archived } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (targetAmount !== undefined) update.targetAmount = targetAmount;
  if (targetDate !== undefined) update.targetDate = targetDate;
  if (linkedCategoryId !== undefined) update.linkedCategoryId = linkedCategoryId || null;
  if (manualProgress !== undefined) update.manualProgress = manualProgress;
  if (archived !== undefined) update.archived = archived;
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, householdId: req.householdId },
    update,
    { new: true }
  );
  if (!goal) return res.status(404).json({ error: "Goal not found" });
  res.json(goal);
});

router.delete("/:id", async (req, res) => {
  await Goal.findOneAndDelete({ _id: req.params.id, householdId: req.householdId });
  res.status(204).end();
});

export default router;
