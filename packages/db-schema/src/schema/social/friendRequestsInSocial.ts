import { pgTable } from "#src/pgTable";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { socialSchema } from "#src/schema/social/socialSchema";
import { sql } from "drizzle-orm";
import { check, index, text } from "drizzle-orm/pg-core";

export const friendRequestsInSocial = pgTable(
  "friendRequests",
  {
    // Natural key — getFriendshipId(senderId, receiverId).
    // Conflicts on insert act as idempotency: if A already sent to B, a second send is a no-op.
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
      check("friendRequests_senderId_receiverId_check", sql`${senderId} != ${receiverId}`),
      index("friendRequests_receiverId_index").on(receiverId),
      index("friendRequests_senderId_index").on(senderId),
    ],
    schema: socialSchema,
  },
);

export type FriendRequestInSocial = typeof friendRequestsInSocial.$inferSelect;
