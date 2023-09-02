import { users } from "@/db/schema/users";
import { pgTable } from "@/db/shared/pgTable";
import { text, timestamp } from "drizzle-orm/pg-core";

export const sessions = pgTable("Session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
