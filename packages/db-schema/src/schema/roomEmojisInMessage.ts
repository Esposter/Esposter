import { createNameCheckSql, createNameSchema } from "#src/models/shared/Name";
import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { roomsInMessage } from "#src/schema/roomsInMessage";
import { sql } from "drizzle-orm";
import { check, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const ROOM_EMOJI_NAME_MAX_LENGTH = 32;
// The shortcode charset, which is the unicode dataset's slug charset. `:name:` in the composer resolves against
// One vocabulary, so a custom name is drawn from the same closed set a dataset slug is — anything else and the
// Autocomplete would have to say which kind of token it is completing
export const ROOM_EMOJI_NAME_REGEX = /^[a-z0-9_]+$/u;

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
  name: (schema) => createNameSchema(ROOM_EMOJI_NAME_MAX_LENGTH, schema).pipe(z.string().regex(ROOM_EMOJI_NAME_REGEX)),
});
