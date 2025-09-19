/*
  Robust Express server for chat-app
  - Uses dotenv for configuration
  - Applies security (helmet), CORS, rate-limiting, compression
  - Logs via morgan in non-production
  - Graceful shutdown and centralized error handling

  Recommended dependencies:
  npm install express dotenv cors helmet morgan express-rate-limit compression

  Env variables (recommended in .env):
  PORT=4000
  NODE_ENV=development
  CORS_ORIGINS=http://localhost:5173
  RATE_LIMIT_WINDOW_MS=60000
  RATE_LIMIT_MAX=100
*/

import path from "path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";

// Load env from project root .env by default
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const isProd = process.env.NODE_ENV === "production";
const PORT = parseInt(process.env.PORT, 10) || 4000;

// CORS origins: allow comma-separated list in CORS_ORIGINS env var
const rawOrigins = process.env.CORS_ORIGINS || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();

// Basic middlewares
app.use(helmet()); // security headers
app.use(compression()); // gzip responses
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

if (!isProd) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Configure CORS: allow list or fallback to same origin
const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser tools (no origin) or if origin matches list
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Rate limiter: tune via environment
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000; // 1 minute
const maxReq = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;
const limiter = rateLimit({
  windowMs,
  max: maxReq,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Simple health / metrics endpoints
app.get("/health", (req, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" })
);

// Example API namespace
const api = express.Router();

api.get("/ping", (_req, res) => {
  res.json({ pong: true, ts: Date.now() });
});

// Auth stub (replace with real auth)
api.post("/auth/signup", (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email-required" });
  // ... create user logic
  res.status(201).json({ id: "user_stub", email });
});

api.post("/auth/login", (req, res) => {
  // ... login logic
  res.json({ token: "stub-token" });
});

app.use("/api", api);

// Static file fallback (optional) - serve frontend if built into ../dist
const clientDist = path.resolve(process.cwd(), "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  // If the file exists in dist, express.static already served it; otherwise send index.html
  const indexFile = path.join(clientDist, "index.html");
  res.sendFile(indexFile, function (err) {
    if (err) next();
  });
});

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  res
    .status(status)
    .json({ error: err && err.message ? err.message : "internal_error" });
});

// Start server with graceful shutdown
const server = app.listen(PORT, () => {
  console.log(
    `Server listening on port ${PORT} (env=${
      process.env.NODE_ENV || "development"
    })`
  );
});

function shutdown(signal) {
  console.log(`Received ${signal}. Closing server...`);
  server.close((err) => {
    if (err) {
      console.error("Error during server close", err);
      process.exit(1);
    }
    console.log("Server closed. Exiting process.");
    process.exit(0);
  });
  // Force exit after timeout
  setTimeout(() => {
    console.warn("Forcing shutdown");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;
