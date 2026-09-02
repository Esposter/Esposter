import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { roomsInMessage } from "#src/schema/roomsInMessage";
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

export const wordFilterActionEnum = pgEnum("wordFilterAction", WordFilterAction);

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
        "roomFilters_words_size_check",
        sql`cardinality(${words}) <= ${sql.raw(FILTER_WORDS_MAX_LENGTH.toString())}`,
      ),
      // A Timeout action requires a positive duration — every other action requires the duration unset.
      check(
        "roomFilters_action_timeoutDurationMs_check",
        sql`(${action} = '${sql.raw(WordFilterAction.Timeout)}' AND ${timeoutDurationMs} IS NOT NULL AND ${timeoutDurationMs} > 0) OR (${action} <> '${sql.raw(WordFilterAction.Timeout)}' AND ${timeoutDurationMs} IS NULL)`,
      ),
    ],
    schema: messageSchema,
  },
);

export type RoomFilterInMessage = typeof roomFiltersInMessage.$inferSelect;

export const selectRoomFilterInMessageSchema = createSelectSchema(roomFiltersInMessage, {
  action: wordFilterActionSchema,
});
