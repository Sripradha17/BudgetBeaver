import { Router } from "express";
import Category from "../models/Category.js";

const router = Router();

router.get("/", async (req, res) => {
  const categories = await Category.find({ householdId: req.householdId });
  res.json(categories);
});

router.post("/", async (req, res) => {
  const { id, label, badgeColor, icon } = req.body;
  const category = await Category.create({ id, label, badgeColor, icon, householdId: req.householdId });
  res.status(201).json(category);
});

router.delete("/:id", async (req, res) => {
  await Category.findOneAndDelete({ id: req.params.id, householdId: req.householdId });
  res.status(204).end();
});

export default router;
