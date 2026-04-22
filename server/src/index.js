require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");

const { connectDb } = require("./db");
const { configurePassport } = require("./auth/passport");

const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todos");
const meRoutes = require("./routes/me");

const PORT = Number(process.env.PORT || 4000);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  await connectDb(MONGODB_URI);
  configurePassport();

  const app = express();

  app.use(
    cors({
      origin: CLIENT_URL,
      credentials: true
    })
  );

  app.use(express.json());

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev_secret_change_me",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        collectionName: "sessions"
      }),
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRoutes);
  app.use("/api/me", meRoutes);
  app.use("/api/todos", todoRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  });

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
    console.log(`Allowed client origin: ${CLIENT_URL}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

