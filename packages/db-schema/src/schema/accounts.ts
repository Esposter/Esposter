import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { text, timestamp } from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
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
});
