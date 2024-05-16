import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./schema/tables.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL ?? "",
  },
  out: "./migrations/local",
  verbose: true,
  strict: true,
});
