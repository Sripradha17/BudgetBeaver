import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");

await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || "budget-beaver" });
console.log("Connected to MongoDB, db:", mongoose.connection.db.databaseName);

const householdSchema = new mongoose.Schema({ createdAt: { type: Date, default: Date.now } });
const Household = mongoose.model("Household", householdSchema);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  householdId: { type: mongoose.Schema.Types.ObjectId, ref: "Household", required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

const db = mongoose.connection.db;

const existingUsers = await User.find({ email: { $in: ["sripradhavbhat@gmail.com", "sarma.mls@gmail.com"] } });
if (existingUsers.length > 0) {
  console.log("Migration already appears to have run — found existing users:", existingUsers.map((u) => u.email));
  await mongoose.disconnect();
  process.exit(0);
}

const household = await Household.create({});
console.log("Created household:", household._id.toString());

const passwordHash = await bcrypt.hash("Sri172@024Sudhi", 10);
const users = await User.insertMany([
  { email: "sripradhavbhat@gmail.com", passwordHash, householdId: household._id },
  { email: "sarma.mls@gmail.com", passwordHash, householdId: household._id },
]);
console.log("Created users:", users.map((u) => u.email));

const collections = ["expenses", "incomes", "categories", "settings"];
for (const name of collections) {
  const result = await db.collection(name).updateMany(
    { householdId: { $exists: false } },
    { $set: { householdId: household._id } }
  );
  console.log(`${name}: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
}

await mongoose.disconnect();
console.log("Done.");
