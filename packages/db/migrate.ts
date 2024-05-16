"server only";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as tables from "./schema/tables";

import postgres from "postgres";

const dbUrl = process.env.MIGRATIONS_DB_URL ?? "";

const migrationClient = postgres(dbUrl, { max: 1 });

console.log("Migrating...");

migrate(
  drizzle(migrationClient, {
    schema: tables,
    logger: {
      logQuery(query, params) {
        console.log(`Query: ${query}`);
      },
    },
  }),
  {
    migrationsFolder:
      process.env.NODE_ENV === "production"
        ? "./migrations/"
        : "./migrations/local/",
  },
)
  .then(() => {
    console.log("Migrations Finished...");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to migrate...", err);
    process.exit(-1);
  });
