import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
  files: text({ mode: "json" }).notNull().default("[]"),
  id: integer().primaryKey({ autoIncrement: true }),
  isEdited: integer({ mode: "boolean" }).notNull().default(false),
  isForward: integer({ mode: "boolean" }).notNull().default(false),
  isPinned: integer({ mode: "boolean" }).notNull().default(false),
  linkPreviewResponse: text({ mode: "json" }),
  mentions: text({ mode: "json" }).notNull().default("[]"),
  message: text().notNull().default(""),
  replyToId: integer(),
  // The name a webhook message was sent under; null for a member's own message
  senderName: text(),
  type: text().notNull(),
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
    userIds: text({ mode: "json" }).notNull().default("[]"),
  },
  (table) => [primaryKey({ columns: [table.messageId, table.emojiTag] })],
);

// The members of this room who have a socket open to it, one row each. A member is online while a row exists, so the
// room's fan-out reads its online members without a query to the database that holds the room's members
export const onlineMembersInRoom = sqliteTable("onlineMembers", { userId: text().primaryKey() });
