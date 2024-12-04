import type { AdapterAccount } from "@auth/core/adapters";

import { pgTable } from "#shared/db/pgTable";
import { users } from "#shared/db/schema/users";
import { relations } from "drizzle-orm";
import { integer, primaryKey, text, uuid } from "drizzle-orm/pg-core";

export const accounts = pgTable(
  "Account",
  {
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    id_token: text("id_token"),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    scope: text("scope"),
    session_state: text("session_state"),
    token_type: text("token_type"),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  ({ provider, providerAccountId }) => [primaryKey({ columns: [provider, providerAccountId] })],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
