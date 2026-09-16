import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  householdId: { type: mongoose.Schema.Types.ObjectId, ref: "Household", required: true },
  // Shown in per-user greetings (e.g. Home page "Good morning, X") so each
  // household member sees their own name, not whoever set up the household.
  // Falls back to the email's local part when blank (old accounts, or a
  // signup that skipped it).
  name: { type: String, trim: true, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
