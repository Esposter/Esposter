import type { Filter } from "#src/models/message/filter/Filter";

import { filterSchema } from "#src/models/message/filter/Filter";
import { messageSchema } from "#src/schema/message/messageSchema";
import { MESSAGE_MAX_LENGTH } from "#src/services/message/constants";
import { createRoomUserColumns } from "#src/services/message/createRoomUserColumns";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { sqliteTable } from "#src/sqliteTable";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { check, index, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const searchHistoriesInMessage = sqliteTable(
  "searchHistories",
  {
    filters: text({ mode: "json" }).notNull().$type<Filter[]>().default([]),
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    query: text().notNull().default(""),
    ...createRoomUserColumns(),
  },
  {
    extraConfig: ({ query, roomId, userId }) => [
      check("searchHistories_query_length_check", createMaxLengthCheckSql(query, MESSAGE_MAX_LENGTH)),
      // A member's history in one room is read by both, and either parent's deletion cascades through it:
      // The user-led index serves a user's reads and their deletion, the room-led index the room's deletion
      index("searchHistories_userId_roomId_index").on(userId, roomId),
      index("searchHistories_roomId_index").on(roomId),
    ],
    schema: messageSchema,
  },
);

export type SearchHistoryInMessage = typeof searchHistoriesInMessage.$inferSelect;

export const selectSearchHistoryInMessageSchema = createSelectSchema(searchHistoriesInMessage, {
  // A row records the filters its search ran with, which are not unique by type — two `has:` narrow together
  filters: filterSchema.array().max(MAX_READ_LIMIT),
  id: () => z.uuidv4(),
  query: (schema) => schema.max(MESSAGE_MAX_LENGTH),
  roomId: () => z.uuidv4(),
});
