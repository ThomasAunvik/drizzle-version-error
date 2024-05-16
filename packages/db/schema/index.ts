import { pgSchema } from "drizzle-orm/pg-core";

export const appSchema = pgSchema("app");

export type AppTableFn = typeof appSchema.table;
