import { socialSchema } from "#src/schema/social/socialSchema";
import { createDistinctCheckSql } from "#src/services/shared/createDistinctCheckSql";
import { createSenderReceiverColumns } from "#src/services/social/createSenderReceiverColumns";
import { createTombstoneIndex } from "#src/services/tombstone/createTombstoneIndex";
import { sqliteTable } from "#src/sqliteTable";
import { check, index, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const friendsInSocial = sqliteTable(
  "friends",
  {
    // Natural key — getFriendshipId(senderId, receiverId).
    // Text PK: every lookup goes through this value, it never changes,
    // And there is exactly one row per user pair.
    id: text().primaryKey(),
    ...createSenderReceiverColumns(),
  },
  {
    extraConfig: ({ deletedAt, receiverId, senderId }) => [
      check("friends_senderId_receiverId_check", createDistinctCheckSql(senderId, receiverId)),
      index("friends_receiverId_index").on(receiverId),
      index("friends_senderId_index").on(senderId),
      createTombstoneIndex("friends", deletedAt),
    ],
    schema: socialSchema,
    scope: { columns: ["senderId", "receiverId"] },
  },
);

export type FriendInSocial = typeof friendsInSocial.$inferSelect;

export const selectFriendInSocialSchema = createSelectSchema(friendsInSocial);
