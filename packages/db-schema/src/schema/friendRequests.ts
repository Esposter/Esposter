import type { User } from "@/schema/users";

import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, index, text } from "drizzle-orm/pg-core";

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
      check("friendRequests_senderId_receiverId_check", sql`${senderId} != ${receiverId}`),
      index("friendRequests_receiverId_index").on(receiverId),
      index("friendRequests_senderId_index").on(senderId),
    ],
  },
);

export type FriendRequest = typeof friendRequests.$inferSelect;
export type FriendRequestWithRelations = FriendRequest & { receiver: User; sender: User };
