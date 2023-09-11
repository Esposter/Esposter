import { users } from "@/db/schema/users";
import { pgTable } from "@/db/shared/pgTable";
import type { AdapterAccount } from "@auth/core/adapters";
import { relations } from "drizzle-orm";
import { integer, primaryKey, text, uuid } from "drizzle-orm/pg-core";

export const accounts = pgTable(
  "Account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    idToken: text("id_token"),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    scope: text("scope"),
    tokenType: text("token_type"),
    sessionState: text("session_state"),
    expiresAt: integer("expires_at"),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
