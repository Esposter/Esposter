import { pgTable } from "#src/pgTable";
import { users } from "#src/schema/users";
import { text, timestamp, unique } from "drizzle-orm/pg-core";

export const accounts = pgTable(
  "accounts",
  {
    accessToken: text(),
    accessTokenExpiresAt: timestamp(),
    accountId: text().notNull(),
    id: text().primaryKey(),
    idToken: text(),
    password: text(),
    providerId: text().notNull(),
    refreshToken: text(),
    refreshTokenExpiresAt: timestamp(),
    scope: text(),
    userId: text()
      .notNull()
      .references(() => users.id),
  },
  {
    extraConfig: ({ accountId, providerId }) => [
      // A provider's account is one identity: better-auth resolves the owner by this pair and throws once two rows
      // Match it, which stops sign-in for that user until the duplicate is removed by hand
      unique("accounts_providerId_accountId_unique").on(providerId, accountId),
    ],
  },
);
