import { pgTable } from "#src/pgTable";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { socialSchema } from "#src/schema/social/socialSchema";
import { sql } from "drizzle-orm";
import { check, index, text } from "drizzle-orm/pg-core";

export const friendsInSocial = pgTable(
  "friends",
  {
    // Natural key — getFriendshipId(senderId, receiverId).
    // Text PK: every lookup goes through this value, it never changes,
    // And there is exactly one row per user pair.
    id: text().primaryKey(),
    receiverId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
    senderId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ receiverId, senderId }) => [
      check("friends_senderId_receiverId_check", sql`${senderId} != ${receiverId}`),
      index("friends_receiverId_index").on(receiverId),
      index("friends_senderId_index").on(senderId),
    ],
    schema: socialSchema,
  },
);

export type FriendInSocial = typeof friendsInSocial.$inferSelect;
