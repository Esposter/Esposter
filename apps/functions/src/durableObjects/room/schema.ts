import type { FileEntity, LinkPreviewResponse, MessageType } from "@esposter/db-schema";

import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// One row is one message in the room. Its id is the room's sequence: `autoIncrement` keeps it from being handed out
// again after the newest row is removed, so it only grows and a page is `id < ?`. Every field a query filters on is a
// column; `files`, `mentions` and the link preview are nested shapes read whole, so they stay JSON. `filenames` is the
// space-joined file names the search index reads, written with the row so the index's triggers stay plain SQL.
// A reply's root is `replyToId`, and a deleted root leaves its replies standing as plain messages. A webhook message
// has no `userId`; its `appUserId` names the webhook identity that sent it
export const messagesInRoom = sqliteTable("messages", {
  appUserId: text(),
  createdAt: integer({ mode: "timestamp_ms" }).notNull(),
  deletedAt: integer({ mode: "timestamp_ms" }),
  filenames: text().notNull().default(""),
  files: text({ mode: "json" }).$type<FileEntity[]>().notNull().default([]),
  id: integer().primaryKey({ autoIncrement: true }),
  isEdited: integer({ mode: "boolean" }).notNull().default(false),
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
});

// One row is one reaction on one message: the members who chose one emoji. A deleted message takes its reactions with it
export const messageEmojisInRoom = sqliteTable(
  "messageEmojis",
  {
    emojiTag: text().notNull(),
    messageId: integer().notNull(),
    userIds: text({ mode: "json" }).$type<string[]>().notNull().default([]),
  },
  (table) => [primaryKey({ columns: [table.messageId, table.emojiTag] })],
);

// The members of this room who have a socket open to it, one row each. A member is online while a row exists, so the
// room's fan-out reads its online members without a query to the database that holds the room's members
export const onlineMembersInRoom = sqliteTable("onlineMembers", { userId: text().primaryKey() });

// The room's own state that is not a message, in one row: when its last message landed, and the room-activity fan-out
// still owed for it. A message schedules the fan-out for two seconds on, and every message in that window is one wave
export const roomState = sqliteTable("roomState", {
  // The time the fan-out is due, or null when none is owed
  bumpDueAt: integer({ mode: "timestamp_ms" }),
  id: integer().primaryKey(),
  // The time of the room's last message, which the fan-out writes as the room's updatedAt
  lastMessageAt: integer({ mode: "timestamp_ms" }),
});

// A message a member scheduled to send here, one row until the alarm sends it or the member cancels it. Its runAt is
// what the alarm sorts by, so the next one due is the first row of that index
export const scheduledMessagesInRoom = sqliteTable(
  "scheduledMessages",
  {
    id: text().primaryKey(),
    message: text().notNull(),
    replyToId: integer(),
    runAt: integer({ mode: "timestamp_ms" }).notNull(),
    userId: text().notNull(),
  },
  (table) => [index("scheduledMessagesRunAtIndex").on(table.runAt)],
);
