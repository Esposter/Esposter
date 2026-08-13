import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, index, text } from "drizzle-orm/pg-core";

export const friends = pgTable(
  "friends",
  {
    // Natural key — getFriendshipId(senderId, receiverId).
    // Text PK: every lookup goes through this value, it never changes,
    // And there is exactly one row per user pair.
    id: text().primaryKey(),
    receiverId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    senderId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ receiverId, senderId }) => [
      check("friends_senderId_receiverId_check", sql`${senderId} != ${receiverId}`),
      index("friends_receiverId_index").on(receiverId),
      index("friends_senderId_index").on(senderId),
    ],
  },
);

export type Friend = typeof friends.$inferSelect;
