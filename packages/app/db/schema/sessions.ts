import { users } from "@/db/schema/users";
import { pgTable } from "@/db/shared/pgTable";
import { relations } from "drizzle-orm";
import { text, timestamp, uuid } from "drizzle-orm/pg-core";

export const sessions = pgTable("Session", {
  expires: timestamp("expires", { mode: "date" }).notNull(),
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
