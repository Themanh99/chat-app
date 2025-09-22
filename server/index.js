import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import mongoose from "mongoose";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Build Mongo URI dynamically
function buildMongoUri() {
  const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME, DB_AUTH_DB } =
    process.env;

  if (DB_USER && DB_PASS) {
    return `mongodb://${encodeURIComponent(DB_USER)}:${encodeURIComponent(
      DB_PASS
    )}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_AUTH_DB || "admin"}`;
  }

  return `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

// Connect to MongoDB
async function connectDB() {
  const uri = buildMongoUri();
  const options = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 50,
    minPoolSize: 5,
    retryWrites: true,
    retryReads: true,
    maxIdleTimeMS: 60000,
  };

  try {
    console.log("🔗 Connecting MongoDB:", uri);
    await mongoose.connect(uri, options);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

const isProd = process.env.NODE_ENV === "production";
const PORT = parseInt(process.env.PORT, 10) || 3000;
const app = express();

// Middlewares
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan(isProd ? "combined" : "dev"));

// CORS setup
app.use(
  cors({
    origin: [process.env.ORIGIN || ""],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Location"],
    credentials: true,
    optionsSuccessStatus: 204,
    preflightContinue: false,
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" });
});

// API namespace
const api = express.Router();

api.get("/ping", (_req, res) => {
  res.json({ pong: true, ts: Date.now() });
});

api.post("/auth/signup", (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email_required" });
  return res.status(201).json({ id: "user_stub", email });
});

api.post("/auth/login", (_req, res) => {
  return res.json({ token: "stub-token" });
});

app.use("/api", api);

// Static frontend
const clientDist = path.resolve(process.cwd(), "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("/*", (req, res, next) => {
    const indexFile = path.join(clientDist, "index.html");
    if (!fs.existsSync(indexFile)) return next();
    res.sendFile(indexFile, (err) => {
      if (err) next(err);
    });
  });
}

// Centralized error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  res
    .status(err?.status || 500)
    .json({ error: err?.message || "internal_error" });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(
    `🚀 Server listening on port ${PORT} (env=${
      process.env.NODE_ENV || "development"
    })`
  );
  await connectDB();
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`\nReceived ${signal}. Closing server...`);
  server.close((err) => {
    if (err) {
      console.error("Error during server close:", err);
      process.exit(1);
    }
    mongoose
      .disconnect()
      .catch((e) => console.warn("Error during mongoose disconnect:", e))
      .finally(() => {
        console.log("Shutdown complete");
        process.exit(0);
      });
  });

  setTimeout(() => {
    console.warn("Forcing shutdown");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;
