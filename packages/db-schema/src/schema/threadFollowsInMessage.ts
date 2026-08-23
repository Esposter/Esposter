import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { roomsInMessage } from "#src/schema/roomsInMessage";
import { users } from "#src/schema/users";
import { boolean, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const threadFollowsInMessage = pgTable(
  "threadFollows",
  {
    // A row is the member's decision about this thread, not only their subscription to it: deleting it on
    // Unfollow would leave "never followed" and "explicitly unfollowed" as the same absence, and auto-follow
    // Cannot then tell whose choice it is about to overwrite. A member who turned the bell off keeps this row
    // With the tombstone set, so the next reply by someone else finds a decision instead of a gap
    isUnfollowed: boolean().notNull().default(false),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    threadRootRowKey: text().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ roomId, threadRootRowKey, userId }) => [
      primaryKey({ columns: [userId, roomId, threadRootRowKey] }),
    ],
    schema: messageSchema,
  },
);

export type ThreadFollowInMessage = typeof threadFollowsInMessage.$inferSelect;

export const selectThreadFollowInMessageSchema = createSelectSchema(threadFollowsInMessage);
