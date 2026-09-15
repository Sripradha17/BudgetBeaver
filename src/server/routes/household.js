import { Router } from "express";
import Household, { generateInviteCode } from "../models/Household.js";
import User from "../models/User.js";

const router = Router();

// Households created before invite codes existed don't have one yet —
// generate and persist one lazily the first time it's asked for, instead of
// requiring a separate migration script.
async function ensureInviteCode(household) {
  if (household.inviteCode) return household;
  for (let attempt = 0; attempt < 5; attempt++) {
    household.inviteCode = generateInviteCode();
    try {
      await household.save();
      return household;
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  }
  throw new Error("Could not generate a unique invite code");
}

router.get("/", async (req, res) => {
  let household = await Household.findById(req.householdId);
  household = await ensureInviteCode(household);
  const members = await User.find({ householdId: req.householdId })
    .select("email createdAt")
    .sort({ createdAt: 1 });
  res.json({ inviteCode: household.inviteCode, members });
});

// Rotates the code so a previously-shared one stops working — the safety
// valve for "I sent that code to the wrong person."
router.post("/regenerate-invite", async (req, res) => {
  const household = await Household.findById(req.householdId);
  for (let attempt = 0; attempt < 5; attempt++) {
    household.inviteCode = generateInviteCode();
    try {
      await household.save();
      return res.json({ inviteCode: household.inviteCode });
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  }
  res.status(500).json({ error: "Could not generate a unique invite code" });
});

export default router;
