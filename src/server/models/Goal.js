import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  householdId: { type: mongoose.Schema.Types.ObjectId, ref: "Household", required: true, index: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  targetDate: { type: Date },
  // When set, progress is the sum of every expense ever logged in this
  // category since startDate. When not set, progress is logged manually.
  linkedCategoryId: { type: String, default: null },
  startDate: { type: Date, default: Date.now },
  manualProgress: { type: Number, default: 0 },
  archived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Goal", goalSchema);
