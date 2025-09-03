import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_HOST: z.string().min(1, "DATABASE_HOST is required"),
  DATABASE_USER: z.string().min(1, "DATABASE_USER is required"),
  DATABASE_PASSWORD: z.string().min(1, "DATABASE_PASSWORD is required"),
  DATABASE_NAME: z.string().min(1, "DATABASE_NAME is required"),
});

export const env = envSchema.parse(process.env);

console.log("✅ Environment variables loaded:", {
  PORT: env.PORT,
  DATABASE_HOST: env.DATABASE_HOST,
  DATABASE_USER: env.DATABASE_USER,
  DATABASE_NAME: env.DATABASE_NAME,
});