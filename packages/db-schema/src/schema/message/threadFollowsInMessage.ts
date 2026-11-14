import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { messagesInMessage } from "#src/schema/message/messagesInMessage";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { sqliteTable } from "#src/sqliteTable";
import { integer, primaryKey, text } from "drizzle-orm/sqlite-core";

export const threadFollowsInMessage = sqliteTable(
  "threadFollows",
  {
    // A row is the member's decision about this thread, not only their subscription to it: deleting it on
    // Unfollow would leave "never followed" and "explicitly unfollowed" as the same absence, and auto-follow
    // Cannot then tell whose choice it is about to overwrite. A member who turned the bell off keeps this row
    // With the tombstone set, so the next reply by someone else finds a decision instead of a gap
    isUnfollowed: integer({ mode: "boolean" }).notNull().default(false),
    roomId: text()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    threadRootId: text()
      .notNull()
      .references(() => messagesInMessage.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ roomId, threadRootId, userId }) => [
      primaryKey({ columns: [userId, roomId, threadRootId] }),
    ],
    schema: messageSchema,
  },
);

export type ThreadFollowInMessage = typeof threadFollowsInMessage.$inferSelect;
