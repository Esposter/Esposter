import type { Filter } from "#src/models/message/filter/Filter";

import { filterSchema } from "#src/models/message/filter/Filter";
import { messageSchema } from "#src/schema/message/messageSchema";
import { MESSAGE_MAX_LENGTH } from "#src/services/message/constants";
import { createRoomUserColumns } from "#src/services/message/createRoomUserColumns";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { sqliteTable } from "#src/sqliteTable";
import { createNormalizedStringSchema, MAX_READ_LIMIT } from "@esposter/shared";
import { check, index, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { v7 } from "uuid";
import { z } from "zod";

export const searchHistoriesInMessage = sqliteTable(
  "searchHistories",
  {
    filters: text({ mode: "json" }).notNull().$type<Filter[]>().default([]),
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    query: text().notNull().default(""),
    ...createRoomUserColumns(),
  },
  {
    extraConfig: ({ filters, id, query, roomId, userId }) => [
      check("searchHistories_query_length_check", createMaxLengthCheckSql(query, MESSAGE_MAX_LENGTH)),
      // A member's history in one room is read by both, and either parent's deletion cascades through it:
      // The user-led index serves a user's reads, newest first by id, and their deletion; the room-led index the room's
      // Deletion
      index("searchHistories_userId_roomId_id_index").on(userId, roomId, id),
      index("searchHistories_roomId_index").on(roomId),
      // A search's identity is its member, room, query and filters. Running one again is the same row, so the insert
      // That Would repeat it meets this constraint, and the create procedure needs no read ahead of the write to avoid
      // A copy
      uniqueIndex("searchHistories_userId_roomId_query_filters_unique").on(userId, roomId, query, filters),
    ],
    schema: messageSchema,
    scope: { columns: ["userId"] },
  },
);

export type SearchHistoryInMessage = typeof searchHistoriesInMessage.$inferSelect;

export const selectSearchHistoryInMessageSchema = createSelectSchema(searchHistoriesInMessage, {
  // A row records the filters its search ran with, which are not unique by type — two `has:` narrow together
  filters: filterSchema.array().max(MAX_READ_LIMIT),
  id: () => z.uuidv7(),
  query: (schema) => createNormalizedStringSchema(MESSAGE_MAX_LENGTH, schema),
  roomId: () => z.uuidv7(),
});
