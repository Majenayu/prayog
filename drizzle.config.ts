import { defineConfig } from "drizzle-kit";

// Drizzle is only used for PostgreSQL fallback
// When using MongoDB (MONGODB_URI is set), this config is not needed
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set - Drizzle config not available. Using MongoDB storage.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://placeholder",
  },
});
