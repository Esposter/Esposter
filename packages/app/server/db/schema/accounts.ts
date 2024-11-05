import type { AdapterAccount } from "@auth/core/adapters";

import { users } from "@/server/db/schema/users";
import { pgTable } from "@/server/db/shared/pgTable";
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
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
