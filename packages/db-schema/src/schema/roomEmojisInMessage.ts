import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { roomsInMessage } from "#src/schema/roomsInMessage";
import { ROOM_EMOJI_NAME_MAX_LENGTH, ROOM_EMOJI_NAME_REGEX } from "#src/services/room/constants";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { normalizeString } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { check, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const roomEmojisInMessage = pgTable(
  "roomEmojis",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name, roomId }) => [
      check("roomEmojis_name_length_check", createNameCheckSql(name, ROOM_EMOJI_NAME_MAX_LENGTH)),
      // The charset lives in one place: the pattern the zod schema rejects on is the pattern the column enforces
      check("roomEmojis_name_charset_check", sql`${name} ~ ${sql.raw(`'${ROOM_EMOJI_NAME_REGEX.source}'`)}`),
      // One shortcode names at most one emoji in a room, which is what makes `:name:` resolvable at all
      uniqueIndex("roomEmojis_roomId_name_unique").on(roomId, name),
    ],
    schema: messageSchema,
  },
);

export type RoomEmojiInMessage = typeof roomEmojisInMessage.$inferSelect;

export const selectRoomEmojiInMessageSchema = createSelectSchema(roomEmojisInMessage, {
  // Every constraint sits on the one final pipe output rather than layering a second pipe over the name helper:
  // A JSON schema is emitted from the outermost pipe alone, so a nested layer silently drops the length bounds
  name: (schema) =>
    schema
      .transform(normalizeString)
      .pipe(z.string().min(1).max(ROOM_EMOJI_NAME_MAX_LENGTH).regex(ROOM_EMOJI_NAME_REGEX)),
});
