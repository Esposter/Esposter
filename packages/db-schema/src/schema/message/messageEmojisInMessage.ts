import { messagesInMessage } from "#src/schema/message/messagesInMessage";
import { messageSchema } from "#src/schema/message/messageSchema";
import { sqliteTable } from "#src/sqliteTable";
import { primaryKey, text } from "drizzle-orm/sqlite-core";

// One row is one reaction on one message: the members who chose one emoji. A deleted message takes its reactions with it
export const messageEmojisInMessage = sqliteTable(
  "messageEmojis",
  {
    emojiTag: text().notNull(),
    messageId: text()
      .notNull()
      .references(() => messagesInMessage.id, { onDelete: "cascade" }),
    userIds: text({ mode: "json" }).notNull().$type<string[]>().default([]),
  },
  {
    extraConfig: ({ emojiTag, messageId }) => [primaryKey({ columns: [messageId, emojiTag] })],
    schema: messageSchema,
  },
);

export type MessageEmojiInMessage = typeof messageEmojisInMessage.$inferSelect;
