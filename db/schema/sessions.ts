import { users } from "@/db/schema/users";
import { pgTable } from "@/db/shared/pgTable";
import { relations } from "drizzle-orm";
import { text, timestamp } from "drizzle-orm/pg-core";

export const sessions = pgTable("Session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
