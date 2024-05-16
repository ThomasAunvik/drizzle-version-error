import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as tables from "./schema/tables";

declare global {
  // eslint-disable-next-line no-var -- only var works here
  var db: PostgresJsDatabase<typeof tables> | undefined;
}

// biome-ignore lint/suspicious/noRedeclare: <explanation>
let db: PostgresJsDatabase<typeof tables>;

const dbUrl = process.env.DB_URL ?? "";

const debugDb = process.env.DB_DEBUG === "true";

if (process.env.NODE_ENV === "production") {
  const queryClient = postgres(dbUrl);
  db = drizzle(queryClient, { schema: tables });
} else {
  if (!global.db) {
    const queryClient = postgres(dbUrl);
    global.db = drizzle(queryClient, { schema: tables, logger: debugDb });
  }

  db = global.db;
}

export { db };
