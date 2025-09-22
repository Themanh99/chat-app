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

export { buildMongoUri, connectDB };
