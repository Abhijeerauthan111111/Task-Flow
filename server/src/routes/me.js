const express = require("express");
const { z } = require("zod");
const { requireAuth } = require("../middleware/requireAuth");
const User = require("../models/User");

const router = express.Router();

const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(50)
});

router.put("/", requireAuth, async (req, res) => {
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid name" });

  const userId = req.user._id;
  const nextName = parsed.data.name;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { name: nextName, profileComplete: true } },
    { new: true }
  ).lean();

  res.json({ id: user._id, email: user.email, name: user.name, photoUrl: user.photoUrl, profileComplete: user.profileComplete });
});

module.exports = router;

