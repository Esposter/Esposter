import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { ROOM_EMOJI_NAME_MAX_LENGTH, ROOM_EMOJI_NAME_REGEX } from "#src/services/room/constants";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { sqliteTable } from "#src/sqliteTable";
import { normalizeString } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { check, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { v7 } from "uuid";
import { z } from "zod";

export const roomEmojisInMessage = sqliteTable(
  "roomEmojis",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    name: text().notNull(),
    roomId: text()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name, roomId }) => [
      check("roomEmojis_name_length_check", createNameCheckSql(name, ROOM_EMOJI_NAME_MAX_LENGTH)),
      // SQLite has no regex operator, so the charset is GLOB's spelling of ROOM_EMOJI_NAME_REGEX: non-empty, and no
      // Character outside the set. The zod schema still tests the regex itself, so a change to it must be mirrored here
      check("roomEmojis_name_charset_check", sql`${name} <> '' AND ${name} NOT GLOB '*[^a-z0-9_]*'`),
      // One shortcode names at most one emoji in a room, which is what makes `:name:` resolvable at all
      uniqueIndex("roomEmojis_roomId_name_unique").on(roomId, name),
    ],
    schema: messageSchema,
  },
);

export type RoomEmojiInMessage = typeof roomEmojisInMessage.$inferSelect;

export const selectRoomEmojiInMessageSchema = createSelectSchema(roomEmojisInMessage, {
  id: () => z.uuidv7(),
  // Every constraint sits on the one final pipe output rather than layering a second pipe over the name helper:
  // A JSON schema is emitted from the outermost pipe alone, so a nested layer silently drops the length bounds
  name: (schema) =>
    schema
      .transform(normalizeString)
      .pipe(z.string().min(1).max(ROOM_EMOJI_NAME_MAX_LENGTH).regex(ROOM_EMOJI_NAME_REGEX)),
  roomId: () => z.uuidv7(),
});
