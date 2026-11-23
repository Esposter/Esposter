import type { LinkPreviewResponse } from "#src/models/message/linkPreview/LinkPreviewResponse";
import type { MessageType } from "#src/models/message/MessageType";
import type { FileEntity } from "#src/models/streams/FileEntity";

import { createVersionSchema } from "#src/createMetadataSchema";
import { createTombstoneIndex } from "#src/services/tombstone/createTombstoneIndex";
import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// One row is one message in the room. Its id is the room's sequence: `autoIncrement` keeps it from being handed out
// Again after the newest row is removed. So it only grows, and a page is `id < ?`. Every field a query filters on is a
// Column. `files`, `mentions` and the link preview are nested shapes read whole, so they stay JSON. `filenames` is the
// `space-joined` file names the search index reads, written with the row. So the index's triggers stay plain SQL. A
// Reply's root is `replyToId`, and a deleted root leaves its replies standing as plain messages. A webhook message has
// No `userId`; its `appUserId` names the webhook identity that sent it. `updatedAt` moves on every change to the row,
// And `editedAt` is the time of the last edit, null for a message never edited
export const messagesInRoom = sqliteTable(
  "messages",
  {
    appUserId: text(),
    // The image the webhook identity had when it sent, copied in so a read names the sender without the app user's row
    appUserImage: text().notNull().default(""),
    createdAt: integer({ mode: "timestamp_ms" }).notNull(),
    deletedAt: integer({ mode: "timestamp_ms" }),
    editedAt: integer({ mode: "timestamp_ms" }),
    filenames: text().notNull().default(""),
    files: text({ mode: "json" }).$type<FileEntity[]>().notNull().default([]),
    id: integer().primaryKey({ autoIncrement: true }),
    isForward: integer({ mode: "boolean" }).notNull().default(false),
    isPinned: integer({ mode: "boolean" }).notNull().default(false),
    linkPreviewResponse: text({ mode: "json" }).$type<LinkPreviewResponse>(),
    mentions: text({ mode: "json" }).$type<string[]>().notNull().default([]),
    message: text().notNull().default(""),
    replyToId: integer(),
    // The name a webhook message was sent under; null for a member's own message
    senderName: text(),
    type: text().$type<MessageType>().notNull(),
    updatedAt: integer({ mode: "timestamp_ms" }).notNull(),
    // Null for a webhook message and for a message whose author's account was erased
    userId: text(),
    // The id a webhook push was accepted under. Unique, so a redelivered push finds the message it already wrote
    webhookDeliveryId: text(),
    ...createVersionSchema(),
  },
  // A thread is read by its root and a member's messages by their author, each in id order, so neither scans the room.
  // The newest-first search without text reads by time, then id, so its keyset is served by the same pair.
  // The pinned messages are the live rows that are pinned, so the index holds only those, in id order
  (table) => [
    index("messagesCreatedAtIndex").on(table.createdAt, table.id),
    index("messagesPinnedIdIndex")
      .on(table.id)
      .where(sql`${table.deletedAt} IS NULL AND ${table.isPinned} = 1`),
    index("messagesReplyToIdIndex").on(table.replyToId, table.id),
    index("messagesUserIdIndex").on(table.userId, table.id),
    uniqueIndex("messagesWebhookDeliveryIdIndex").on(table.webhookDeliveryId),
  ],
);

// One row is one reaction on one message: the members who chose one emoji. A reaction nobody chooses keeps its row with
// No Reactor, at the version its removal raised, so a copy from before the removal cannot put it back. A deleted
// Message Takes its reactions with it
export const messageEmojisInRoom = sqliteTable(
  "messageEmojis",
  {
    emojiTag: text().notNull(),
    messageId: integer().notNull(),
    userIds: text({ mode: "json" }).$type<string[]>().notNull().default([]),
    ...createVersionSchema(),
  },
  (table) => [primaryKey({ columns: [table.messageId, table.emojiTag] })],
);

// The members of this room who have a socket open to it, one row each. A member is online while a row exists.
// So the room's fan-out reads its online members without a query to the database that holds the room's members
export const onlineMembersInRoom = sqliteTable("onlineMembers", {
  userId: text().primaryKey(),
  ...createVersionSchema(),
});

// The room's own state that is not a message, in one row. It holds the room-activity fan-out still owed. A message
// Schedules the fan-out for two seconds on, and every message in That window is one wave. The wave's time is the newest
// Message's, which the messages already hold
export const roomState = sqliteTable("roomState", {
  // The time the fan-out is due, or null when none is owed
  bumpDueAt: integer({ mode: "timestamp_ms" }),
  id: integer().primaryKey(),
  ...createVersionSchema(),
});

// A sent message whose sender's index does not yet hold it. The object retries each one from its alarm until the index
// Takes It, so a failed index write is repaired rather than leaving the message out of the sender's sent list
export const unindexedMessagesInRoom = sqliteTable("unindexedMessages", {
  createdAt: integer({ mode: "timestamp_ms" }).notNull(),
  messageId: integer().primaryKey(),
  // The next time the index is asked again
  retryAt: integer({ mode: "timestamp_ms" }).notNull(),
  userId: text().notNull(),
  ...createVersionSchema(),
});

// A message a member scheduled to send here, one row until the alarm sends it or the member cancels it. Either leaves a
// Tombstone with its text cleared, which no read returns and the alarm never sends, until the purge removes it.
// Its runAt is what the alarm sorts by, so the next one due is the first live row of that index
export const scheduledMessagesInRoom = sqliteTable(
  "scheduledMessages",
  {
    deletedAt: integer({ mode: "timestamp_ms" }),
    id: text().primaryKey(),
    message: text().notNull(),
    replyToId: integer(),
    runAt: integer({ mode: "timestamp_ms" }).notNull(),
    userId: text().notNull(),
    ...createVersionSchema(),
  },
  (table) => [
    index("scheduledMessagesRunAtIndex").on(table.runAt),
    createTombstoneIndex("scheduledMessages", table.deletedAt),
  ],
);
