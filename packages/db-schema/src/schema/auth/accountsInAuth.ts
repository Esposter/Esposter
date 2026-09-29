import { pgTable } from "#src/pgTable";
import { authSchema } from "#src/schema/auth/authSchema";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { text, timestamp, unique } from "drizzle-orm/pg-core";

export const accountsInAuth = pgTable(
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
      .references(() => usersInAuth.id),
  },
  {
    extraConfig: ({ accountId, providerId }) => [
      // A provider's account is one identity: better-auth resolves the owner by this pair and throws once two rows
      // Match it, which stops sign-in for that user until the duplicate is removed by hand
      unique("accounts_providerId_accountId_unique").on(providerId, accountId),
    ],
    schema: authSchema,
  },
);
