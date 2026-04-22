const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure" }),
  (req, res) => {
    res.redirect("/tasks");
  }
);

router.get("/failure", (_req, res) => {
  res.status(401).send("Google authentication failed. Go back and try again.");
});

router.get("/me", (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const { _id, email, name, photoUrl, profileComplete } = req.user;
  res.json({ id: _id, email, name, photoUrl, profileComplete });
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    if (req.session) {
      req.session.destroy(() => res.clearCookie("connect.sid").json({ ok: true }));
    } else {
      res.json({ ok: true });
    }
  });
});

module.exports = router;
