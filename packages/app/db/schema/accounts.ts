import type { AdapterAccount } from "@auth/core/adapters";

import { users } from "@/db/schema/users";
import { pgTable } from "@/db/shared/pgTable";
import { relations } from "drizzle-orm";
import { integer, primaryKey, text, uuid } from "drizzle-orm/pg-core";

export const accounts = pgTable(
  "Account",
  {
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    idToken: text("id_token"),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refreshToken: text("refresh_token"),
    scope: text("scope"),
    sessionState: text("session_state"),
    tokenType: text("token_type"),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
