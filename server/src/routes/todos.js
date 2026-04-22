const express = require("express");
const mongoose = require("mongoose");
const { z } = require("zod");
const Todo = require("../models/Todo");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

const createSchema = z.object({
  title: z.string().trim().min(1).max(100),
  notes: z.string().trim().max(500).optional().default(""),
  dueDate: z.string().datetime().optional().nullable()
});

const updateSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  notes: z.string().trim().max(500).optional(),
  dueDate: z.string().datetime().optional().nullable()
});

function parseDueDate(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

router.get("/", requireAuth, async (req, res) => {
  const status = String(req.query.status || "all");
  const filter = { userId: req.user._id };

  if (status === "active") filter.completed = false;
  if (status === "done") filter.completed = true;

  const todos = await Todo.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ todos });
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const dueDate = parseDueDate(parsed.data.dueDate);
  if (parsed.data.dueDate !== undefined && dueDate === undefined) return res.status(400).json({ error: "Invalid dueDate" });

  const todo = await Todo.create({
    userId: req.user._id,
    title: parsed.data.title,
    notes: parsed.data.notes || "",
    dueDate: dueDate ?? null,
    completed: false
  });

  res.status(201).json({ todo });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const updates = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
  if (parsed.data.dueDate !== undefined) {
    const dueDate = parseDueDate(parsed.data.dueDate);
    if (parsed.data.dueDate !== null && dueDate === undefined) return res.status(400).json({ error: "Invalid dueDate" });
    updates.dueDate = dueDate;
  }

  const todo = await Todo.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { $set: updates },
    { new: true }
  ).lean();

  if (!todo) return res.status(404).json({ error: "Not found" });
  res.json({ todo });
});

router.patch("/:id/toggle", requireAuth, async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

  const todo = await Todo.findOne({ _id: id, userId: req.user._id });
  if (!todo) return res.status(404).json({ error: "Not found" });

  todo.completed = !todo.completed;
  await todo.save();

  res.json({ todo });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

  const deleted = await Todo.findOneAndDelete({ _id: id, userId: req.user._id }).lean();
  if (!deleted) return res.status(404).json({ error: "Not found" });

  res.json({ ok: true });
});

module.exports = router;

