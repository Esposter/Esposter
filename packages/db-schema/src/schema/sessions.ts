import { pgTable } from "#src/pgTable";
import { users } from "#src/schema/users";
import { text, timestamp } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  expiresAt: timestamp().notNull(),
  id: text().primaryKey(),
  ipAddress: text(),
  token: text().notNull().unique(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});
