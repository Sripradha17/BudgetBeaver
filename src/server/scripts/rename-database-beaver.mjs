import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const OLD_DB = "budget-raccoon";
const NEW_DB = "budget-beaver";

const conn = await mongoose.createConnection(MONGODB_URI).asPromise();

const oldDb = conn.useDb(OLD_DB);
const newDb = conn.useDb(NEW_DB);

const collections = (await oldDb.db.listCollections().toArray()).map((c) => c.name);
console.log(`Collections in "${OLD_DB}":`, collections);

for (const name of collections) {
  const docs = await oldDb.collection(name).find({}).toArray();
  if (docs.length === 0) {
    console.log(`${name}: 0 documents, skipping`);
    continue;
  }
  await newDb.collection(name).insertMany(docs, { ordered: true });
  const oldCount = docs.length;
  const newCount = await newDb.collection(name).countDocuments();
  console.log(`${name}: copied ${oldCount} -> new db has ${newCount} ${oldCount === newCount ? "OK" : "MISMATCH!"}`);
}

console.log("\nDone. Old database left untouched as a backup — nothing deleted.");
await conn.close();
