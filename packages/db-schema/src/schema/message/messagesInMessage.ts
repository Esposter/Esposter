import type { FileEntity } from "#src/models/streams/FileEntity";
import type { LinkPreviewResponse } from "#src/models/message/linkPreview/LinkPreviewResponse";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";

import { MessageType } from "#src/models/message/MessageType";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { appUsersInMessage } from "#src/schema/message/appUsersInMessage";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { createEnumColumn } from "#src/services/shared/createEnumColumn";
import { sqliteTable } from "#src/sqliteTable";
import { index, integer, text } from "drizzle-orm/sqlite-core";

// One row is one message. Every field a query filters, sorts or joins on is a column; `files` and the link preview are
// nested shapes read whole, so they stay JSON. `filenames` is the space-joined file names the search index reads, written
// with the row so the index's triggers stay plain SQL over this table
export const messagesInMessage = sqliteTable(
  "messages",
  {
    // The webhook identity that sent the message. Its display name and avatar are copied onto the message, so a later
    // rename of the webhook leaves the history it sent as it was said
    appUserId: text().references(() => appUsersInMessage.id, { onDelete: "set null" }),
    appUserImage: text().notNull().default(""),
    filenames: text().notNull().default(""),
    files: text({ mode: "json" }).notNull().$type<FileEntity[]>().default([]),
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    isEdited: integer({ mode: "boolean" }).notNull().default(false),
    isForward: integer({ mode: "boolean" }).notNull().default(false),
    isPinned: integer({ mode: "boolean" }).notNull().default(false),
    linkPreviewResponse: text({ mode: "json" }).$type<LinkPreviewResponse | null>(),
    mentions: text({ mode: "json" }).notNull().$type<string[]>().default([]),
    message: text().notNull().default(""),
    // A reply's root message. A deleted root leaves its replies standing as plain messages
    replyToId: text().references((): AnySQLiteColumn => messagesInMessage.id, { onDelete: "set null" }),
    roomId: text()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    // The name a webhook message was sent under; null for a member's own message
    senderName: text(),
    type: createEnumColumn(MessageType).notNull(),
    // Nullable and set null on deletion: an account's messages in rooms it joined outlive it, with their content erased
    userId: text().references(() => usersInAuth.id, { onDelete: "set null" }),
  },
  {
    extraConfig: ({ createdAt, id, replyToId, roomId, userId }) => [
      // A room's newest-first read and its cursor: the order is (createdAt, id), so one index serves both
      index("messages_roomId_createdAt_id_index").on(roomId, createdAt, id),
      // A thread's replies, and a member's messages in one room (the soft delete and erase sweeps of a ban)
      index("messages_replyToId_index").on(replyToId),
      index("messages_roomId_userId_index").on(roomId, userId),
    ],
    schema: messageSchema,
  },
);

export type MessageInMessage = typeof messagesInMessage.$inferSelect;
