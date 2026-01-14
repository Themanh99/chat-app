
import mongoose, { ConnectOptions } from "mongoose";
import { env } from "../config/env.js";

// Build Mongo URI dynamically
export function buildMongoUri(): string {
  const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME, DB_AUTH_DB } = env;

  if (DB_USER && DB_PASS) {
    return `mongodb://${encodeURIComponent(DB_USER)}:${encodeURIComponent(
      DB_PASS
    )}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_AUTH_DB || "admin"}`;
  }

  return `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

// Connect to MongoDB
export async function connectDB(): Promise<void> {
  const uri = buildMongoUri();
  const options: ConnectOptions = {
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
