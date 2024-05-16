import { relations } from "drizzle-orm";
import {
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { foreignKey } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";
import { appSchema } from ".";
import { caseMessageTable } from "./case_message";
import { caseUserTable } from "./case_user";
import { checkpointTable } from "./checkpoint";
import { inspectionsTable } from "./inspection";
import { organizationUsersTable } from "./organization_user";
import { organizationUserRoles } from "./organization_user_role";
import { userReadCasesTable } from "./user_read_cases";

export const usersTable = appSchema.table(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 60 }),
    lastName: varchar("last_name", { length: 60 }),
    authId: text("auth_id"),
    createdById: uuid("created_by_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    globalAdmin: boolean("global_admin").default(false),
    globalAdminEnabled: boolean("global_admin_enabled").default(false),
  },
  (t) => ({
    emailIdx: uniqueIndex("email_idx").on(t.email),
    authIdIdx: uniqueIndex("user_auth_id_idx").on(t.authId),
    createdByIdFk: foreignKey({
      columns: [t.createdById],
      foreignColumns: [t.id],
    }),
  }),
);

export const userRelations = relations(usersTable, ({ many }) => ({
  organizations: many(organizationUsersTable),
  roles: many(organizationUserRoles),
  caseMessages: many(caseMessageTable),
  createdCheckpoints: many(checkpointTable),
  updatedCheckpoints: many(checkpointTable),
  inspections: many(inspectionsTable),
  cases: many(caseUserTable),
  taggedMessages: many(caseMessageTable),
  readCases: many(userReadCasesTable),
}));
