import { pgTable } from "#src/pgTable";
import { authSchema } from "#src/schema/auth/authSchema";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { index, text, timestamp } from "drizzle-orm/pg-core";

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
  {
    extraConfig: ({ userId }) => [
      // A user's active sessions are read by owner, and a user's deletion cascades through it
      index("sessions_userId_index").on(userId),
    ],
    schema: authSchema,
  },
);
