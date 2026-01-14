
import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.union([z.literal("development"), z.literal("production")]).default("development"),
  
  // Rate Limit
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  
  // JWT
  JWT_SECRET: z.string().min(1),
  JWT_KEY: z.string().min(1),
  
  // CORS
  ORIGIN: z.string().default("*"),
  
  // MongoDB
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(27017),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().optional(),
  DB_PASS: z.string().optional(),
  DB_AUTH_DB: z.string().default("admin"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
