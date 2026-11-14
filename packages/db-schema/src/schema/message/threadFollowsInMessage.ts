import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
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
    // The thread's root message, by the integer id its room's object numbers it with. The message is stored in that
    // object rather than in this database, so this is a number the object hands out and not a foreign key
    threadRootId: integer().notNull(),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    // A thread's followers are read by (roomId, threadRootId), so the key leads with them
    extraConfig: ({ roomId, threadRootId, userId }) => [primaryKey({ columns: [roomId, threadRootId, userId] })],
    schema: messageSchema,
  },
);

export type ThreadFollowInMessage = typeof threadFollowsInMessage.$inferSelect;
