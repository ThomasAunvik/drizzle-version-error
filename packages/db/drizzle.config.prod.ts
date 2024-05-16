import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./schema/tables.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DB_URL ?? "",
  },
  out: "./migrations",
  verbose: true,
  strict: true,
});
