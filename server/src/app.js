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

let appInstance = null;

function allowOrigin(origin, allowed) {
  if (!origin) return true;
  if (!allowed) return true;
  return origin === allowed;
}

async function getApp() {
  if (appInstance) return appInstance;

  const PORT = Number(process.env.PORT || 4000);
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
  const MONGODB_URI = process.env.MONGODB_URI;

  await connectDb(MONGODB_URI);
  configurePassport();

  const app = express();

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: (origin, cb) => cb(null, allowOrigin(origin, CLIENT_URL)),
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
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/api/health", (_req, res) => res.json({ ok: true, port: PORT }));

  app.use("/api/auth", authRoutes);
  app.use("/api/me", meRoutes);
  app.use("/api/todos", todoRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  });

  appInstance = app;
  return appInstance;
}

module.exports = { getApp };

