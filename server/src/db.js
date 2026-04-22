const mongoose = require("mongoose");

let connectPromise = null;

async function connectDb(mongoUri) {
  if (!mongoUri) throw new Error("Missing MONGODB_URI");
  mongoose.set("strictQuery", true);
  if (mongoose.connection.readyState === 1) return;
  if (!connectPromise) connectPromise = mongoose.connect(mongoUri);
  await connectPromise;
}

module.exports = { connectDb };
