import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { text, timestamp, unique } from "drizzle-orm/pg-core";

export const accounts = pgTable(
  "accounts",
  {
    accessToken: text(),
    accessTokenExpiresAt: timestamp(),
    accountId: text().notNull(),
    id: text().primaryKey(),
    idToken: text(),
    // Identity namespace the `accountId` was issued in — the provider's own issuer for an OIDC provider,
    // Otherwise a synthetic `local:…` one better-auth derives from the provider id. Paired with `accountId`
    // It is the account's real identity, which is why the uniqueness below is on the pair rather than on
    // `accountId` alone: two providers may hand out the same subject id
    issuer: text().notNull(),
    password: text(),
    providerId: text().notNull(),
    refreshToken: text(),
    refreshTokenExpiresAt: timestamp(),
    scope: text(),
    userId: text()
      .notNull()
      .references(() => users.id),
  },
  { extraConfig: ({ accountId, issuer }) => [unique("accounts_issuer_accountId_unique").on(issuer, accountId)] },
);
