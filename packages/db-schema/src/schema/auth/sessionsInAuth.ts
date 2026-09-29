import { pgTable } from "#src/pgTable";
import { authSchema } from "#src/schema/auth/authSchema";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { text, timestamp } from "drizzle-orm/pg-core";

export const sessionsInAuth = pgTable(
  "sessions",
  {
    expiresAt: timestamp().notNull(),
    id: text().primaryKey(),
    ipAddress: text(),
    token: text().notNull().unique(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  { schema: authSchema },
);
