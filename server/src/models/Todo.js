const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
    dueDate: { type: Date, default: null },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);

