import type { User } from "@/schema/users";

import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, index, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const friendRequests = pgTable(
  "friendRequests",
  {
    // Natural key — getFriendshipId(senderId, receiverId).
    // Conflicts on insert act as idempotency: if A already sent to B, a second send is a no-op.
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
      check("no_self_friend_request", sql`${senderId} != ${receiverId}`),
      index("friend_requests_receiverId_index").on(receiverId),
      index("friend_requests_senderId_index").on(senderId),
    ],
  },
);

export type FriendRequest = typeof friendRequests.$inferSelect;
export type FriendRequestWithRelations = FriendRequest & { receiver: User; sender: User };

export const selectFriendRequestSchema = createSelectSchema(friendRequests, {
  id: (schema) => schema.min(1),
});
