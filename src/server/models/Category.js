import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  householdId: { type: mongoose.Schema.Types.ObjectId, ref: "Household", required: true, index: true },
  id: { type: String, required: true },
  label: { type: String, required: true },
  badgeColor: { type: String, required: true },
  // Name of one of the fixed icon options in lib/categories.js (ICON_OPTIONS),
  // not an arbitrary string — falls back to a generic icon if unset/unknown.
  icon: { type: String, default: "" },
});

// A category's short id ("gifts") only needs to be unique within its own
// household, not globally — two different households can each have "gifts".
categorySchema.index({ householdId: 1, id: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
