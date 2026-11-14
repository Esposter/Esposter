import { WordFilterAction } from "#src/models/message/filter/WordFilterAction";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { FILTER_WORDS_MAX_LENGTH } from "#src/services/message/filter/constants";
import { createEnumColumn } from "#src/services/shared/createEnumColumn";
import { sqliteTable } from "#src/sqliteTable";
import { sql } from "drizzle-orm";
import { check, integer, text } from "drizzle-orm/sqlite-core";

export const roomFiltersInMessage = sqliteTable(
  "roomFilters",
  {
    action: createEnumColumn(WordFilterAction).notNull().default(WordFilterAction.Reject),
    roomId: text()
      .primaryKey()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    timeoutDurationMs: integer(),
    words: text({ mode: "json" }).notNull().$type<string[]>().default([]),
  },
  {
    extraConfig: ({ action, timeoutDurationMs, words }) => [
      check(
        "roomFilters_words_size_check",
        sql`json_array_length(${words}) <= ${sql.raw(FILTER_WORDS_MAX_LENGTH.toString())}`,
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
