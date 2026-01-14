
import express from "express";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

import { env } from "./config/env.js";
import authRoutes from "./routes/AuthRoutes.js";
import { errorHandler } from "./middlewares/ErrorHandler.js";

import { connectDB } from "./helpers/common-helper.js";

// ... (removed buildMongoUri and connectDB definitions)

const app = express();

// Middlewares
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS setup
app.use(
  cors({
    origin: [env.ORIGIN],
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
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: env.NODE_ENV });
});

app.use("/api/auth", authRoutes);

// Static frontend (Verify relative path)
const clientDist = path.resolve(process.cwd(), "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/.*/, (req, res, next) => {
    const indexFile = path.join(clientDist, "index.html");
    if (!fs.existsSync(indexFile)) return next();
    res.sendFile(indexFile, (err) => {
      if (err) next(err);
    });
  });
}

// Centralized error handler
app.use(errorHandler);

// Start server
const server = app.listen(env.PORT, async () => {
  console.log(
    `🚀 Server listening on port ${env.PORT} (env=${env.NODE_ENV})`
  );
  await connectDB();
});

// Graceful shutdown
function shutdown(signal: string) {
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
