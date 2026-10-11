import { pgTable } from "#src/pgTable";
import { createSenderReceiverColumns } from "#src/schema/social/senderReceiverColumns";
import { socialSchema } from "#src/schema/social/socialSchema";
import { createDistinctCheckSql } from "#src/services/shared/createDistinctCheckSql";
import { check, index, text } from "drizzle-orm/pg-core";

export const friendRequestsInSocial = pgTable(
  "friendRequests",
  {
    // Natural key — getFriendshipId(senderId, receiverId).
    // Conflicts on insert act as idempotency: if A already sent to B, a second send is a no-op.
    id: text().primaryKey(),
    ...createSenderReceiverColumns(),
  },
  {
    extraConfig: ({ receiverId, senderId }) => [
      check("friendRequests_senderId_receiverId_check", createDistinctCheckSql(senderId, receiverId)),
      index("friendRequests_receiverId_index").on(receiverId),
      index("friendRequests_senderId_index").on(senderId),
    ],
    schema: socialSchema,
  },
);

export type FriendRequestInSocial = typeof friendRequestsInSocial.$inferSelect;
