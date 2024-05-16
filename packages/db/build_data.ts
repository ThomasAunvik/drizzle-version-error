"server only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as tables from "./schema/tables";

const dbUrl = process.env.MIGRATIONS_DB_URL ?? "";
const queryClient = postgres(dbUrl);
const db = drizzle(queryClient, { schema: tables });

console.log("Generating Data...");

const generateData = async () => {
  try {
    const orgResult = await db
      .insert(tables.organizationTable)
      .values([
        {
          name: "Exigo AS",
          urlName: "ExigoAS",
        },
        {
          name: "Orkel AS",
          urlName: "OrkelAS",
        },
      ])
      .onConflictDoNothing()
      .returning({ orgId: tables.organizationTable.id });

    const userResult = await db
      .insert(tables.usersTable)
      .values([
        {
          firstName: "Thomas",
          lastName: "Aunvik",
          email: "thomas.aunvik@exigo.no",
          authId: "1e80d6e2-a169-41c9-95b2-b2909e165a2c",
          globalAdmin: true,
        },
        {
          firstName: "Erik",
          lastName: "Fossum",
          email: "erik.fossum@exigo.no",
          authId: "7631a298-1488-4f60-bace-066e1e69386c",
          globalAdmin: true,
        },
        {
          firstName: "Øystein",
          lastName: "Økland",
          email: "oystein.okland@exigo.no",
          authId: "db1ae2ce-678a-4b2d-b5c4-47e9e686a3f5",
          globalAdmin: true,
        },
      ])
      .onConflictDoNothing()
      .returning({ userId: tables.usersTable.id });

    await db
      .insert(tables.prioritiesTable)
      .values([
        {
          name: "High",
        },
        {
          name: "Medium",
        },
        {
          name: "Low",
        },
      ])
      .onConflictDoNothing();

    const newMembers = orgResult.flatMap((org) =>
      userResult.map(
        (u) =>
          ({
            orgId: org.orgId,
            userId: u.userId,
          }) as typeof tables.organizationUsersTable.$inferInsert,
      ),
    );

    await db
      .insert(tables.organizationUsersTable)
      .values(newMembers)
      .onConflictDoNothing();

    console.log("Finished generating data...");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }
};

generateData();
