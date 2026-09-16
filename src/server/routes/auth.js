import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Household, { generateInviteCode } from "../models/Household.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// "sudheendra.bhat@gmail.com" -> "Sudheendra" — used when a user has no
// explicit name set, so the greeting never shows something blank.
function nameFromEmail(email) {
  const local = email.split("@")[0].split(/[._-]+/)[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      householdId: user.householdId.toString(),
      email: user.email,
      name: user.name || nameFromEmail(user.email),
    },
    process.env.JWT_SECRET,
    { expiresIn: "90d" }
  );
}

// Retries on the rare invite-code collision (the unique index rejects it)
// rather than trusting randomness alone to never repeat.
async function createHouseholdWithUniqueInvite() {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await Household.create({ inviteCode: generateInviteCode() });
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  }
  throw new Error("Could not generate a unique invite code");
}

// New account: gets its own brand-new, empty household by default. Passing
// the invite code from an existing household's Settings page joins that
// household instead, so its data becomes shared rather than duplicated.
router.post("/signup", async (req, res) => {
  const { email, password, inviteCode, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ error: "An account with this email already exists" });

  let household;
  if (inviteCode && inviteCode.trim()) {
    household = await Household.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!household) return res.status(400).json({ error: "Invalid invite code" });
  } else {
    household = await createHouseholdWithUniqueInvite();
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    householdId: household._id,
    name: (name || "").trim(),
  });

  res.status(201).json({ token: signToken(user) });
});

// Lets a signed-in user change their own display name (shown in per-user
// greetings). Re-issues the token since the name is baked into its payload.
router.put("/me", requireAuth, async (req, res) => {
  const { name } = req.body;
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }
  const user = await User.findByIdAndUpdate(req.userId, { name: name.trim() }, { new: true });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ token: signToken(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) return res.status(401).json({ error: "Incorrect email or password" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Incorrect email or password" });

  res.json({ token: signToken(user) });
});

export default router;
