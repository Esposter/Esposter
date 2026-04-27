import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, index, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const friends = pgTable(
  "friends",
  {
    // Natural key — getFriendshipId(senderId, receiverId).
    // Text PK: every lookup goes through this value, it never changes,
    // And there is exactly one row per user pair.
    id: text("id").primaryKey(),
    receiverId: text("receiverId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    senderId: text("senderId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ receiverId, senderId }) => [
      check("no_self_friendship", sql`${senderId} != ${receiverId}`),
      index("friends_receiverId_index").on(receiverId),
      index("friends_senderId_index").on(senderId),
    ],
  },
);

export type Friend = typeof friends.$inferSelect;

export const selectFriendSchema = createSelectSchema(friends, {
  id: z.string().min(1),
});
