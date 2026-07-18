import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { sql } from "drizzle-orm";
import { check, integer, pgEnum, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const FILTER_KEY_MAX_LENGTH = 100;
export const FILTER_WORDS_MAX_LENGTH = 1000;

// The automatic action taken when a message matches the room's word filter. Reject is the default
// (block the message with an error) — Warn and Timeout additionally record a moderation action.
export enum WordFilterAction {
  Reject = "Reject",
  Timeout = "Timeout",
  Warn = "Warn",
}

export const wordFilterActionSchema = z.enum(WordFilterAction) satisfies z.ZodType<WordFilterAction>;

export const wordFilterActionEnum = pgEnum("word_filter_action", WordFilterAction);

export const roomFiltersInMessage = pgTable(
  "roomFilters",
  {
    action: wordFilterActionEnum().notNull().default(WordFilterAction.Reject),
    roomId: uuid()
      .primaryKey()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    timeoutDurationMs: integer(),
    words: text().array().notNull().default([]),
  },
  {
    extraConfig: ({ action, timeoutDurationMs, words }) => [
      check(
        "room_filters_words_size_check",
        sql`cardinality(${words}) <= ${sql.raw(FILTER_WORDS_MAX_LENGTH.toString())}`,
      ),
      // A Timeout action requires a positive duration — every other action requires the duration unset.
      check(
        "room_filters_timeout_duration_check",
        sql`(${action} = 'Timeout' AND ${timeoutDurationMs} IS NOT NULL AND ${timeoutDurationMs} > 0) OR (${action} <> 'Timeout' AND ${timeoutDurationMs} IS NULL)`,
      ),
    ],
    schema: messageSchema,
  },
);

export type RoomFilterInMessage = typeof roomFiltersInMessage.$inferSelect;

export const selectRoomFilterInMessageSchema = createSelectSchema(roomFiltersInMessage, {
  action: wordFilterActionSchema,
});
