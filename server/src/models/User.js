const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, default: "" },
    name: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    profileComplete: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

