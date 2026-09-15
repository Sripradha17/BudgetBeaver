import mongoose from "mongoose";
import crypto from "crypto";

// A household is a data-ownership boundary — everyone in it sees the same
// shared expenses/income/budgets. A new signup gets its own fresh, empty
// household unless they sign up with another household's invite code.
const householdSchema = new mongoose.Schema({
  inviteCode: { type: String, unique: true, sparse: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Household", householdSchema);

// Excludes visually-ambiguous characters (0/O, 1/I/L) so a code read aloud or
// hand-copied is never misheard/mistyped.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateInviteCode(length = 8) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
  }
  return code;
}
