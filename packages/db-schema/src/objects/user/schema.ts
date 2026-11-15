import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// The messages a person sent, one row each, appended by the room that stored the message and removed when it is deleted.
// Its newest-first page reads by createdAt, and a room's own rows are found by the key
export const sentMessagesInUser = sqliteTable(
  "sentMessagesInUser",
  { createdAt: integer({ mode: "timestamp_ms" }).notNull(), messageId: integer().notNull(), roomId: text().notNull() },
  (table) => [
    primaryKey({ columns: [table.roomId, table.messageId] }),
    index("sentMessagesInUserCreatedAtIndex").on(table.createdAt, table.roomId, table.messageId),
  ],
);

// The calls without a room a person was admitted to, one row each until their last session leaves.
// No D1 row names who sits in such a call, so a revoked session is closed on each of these
export const joinedCallsInUser = sqliteTable("joinedCallsInUser", { callSessionId: text().primaryKey() });

// The scheduled messages a person has pending, one row each until the room delivers or cancels them.
// Ordered by when they run, then by id, which is what their list shows and what its keyset reads by
export const scheduledMessagesInUser = sqliteTable(
  "scheduledMessagesInUser",
  { roomId: text().notNull(), runAt: integer({ mode: "timestamp_ms" }).notNull(), scheduledId: text().primaryKey() },
  (table) => [index("scheduledMessagesInUserRunAtScheduledIdIndex").on(table.runAt, table.scheduledId)],
);

// A reminder a person set for themselves, one row until the alarm sends it.
// The room it was set in is what its notification links to.
// The index on runAt then id is what the alarm reads for the next one due, and what the list's keyset reads by
export const remindersInUser = sqliteTable(
  "remindersInUser",
  {
    id: text().primaryKey(),
    roomId: text().notNull(),
    runAt: integer({ mode: "timestamp_ms" }).notNull(),
    text: text().notNull(),
  },
  (table) => [index("remindersInUserRunAtIdIndex").on(table.runAt, table.id)],
);

// A TodoList item's reminder, one row per item with a due date still ahead.
// The alarm runs the rows that are due and re-arms for the earliest one left, so it reads the index on dueAt
export const todoRemindersInUser = sqliteTable(
  "todoRemindersInUser",
  { dueAt: integer({ mode: "timestamp_ms" }).notNull(), itemId: text().notNull(), resourceId: text().notNull() },
  (table) => [
    primaryKey({ columns: [table.resourceId, table.itemId] }),
    index("todoRemindersInUserDueAtIndex").on(table.dueAt),
  ],
);
