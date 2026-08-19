import type { Filter } from "@/models/message/filter/Filter";

import { MESSAGE_MAX_LENGTH } from "@/models/message/BaseMessageEntity";
import { filterSchema } from "@/models/message/filter/Filter";
import { createMaxLengthCheckSql } from "@/models/shared/Check";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { check, jsonb, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const searchHistoriesInMessage = pgTable(
  "searchHistories",
  {
    filters: jsonb().notNull().$type<Filter[]>().default([]),
    id: uuid().primaryKey().defaultRandom(),
    query: text().notNull().default(""),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id),
    userId: text()
      .notNull()
      .references(() => users.id),
  },
  {
    extraConfig: ({ query }) => [
      check("searchHistories_query_length_check", createMaxLengthCheckSql(query, MESSAGE_MAX_LENGTH)),
    ],
    schema: messageSchema,
  },
);

export type SearchHistoryInMessage = typeof searchHistoriesInMessage.$inferSelect;

export const selectSearchHistoryInMessageSchema = createSelectSchema(searchHistoriesInMessage, {
  // A row records the filters its search ran with, which are not unique by type — two `has:` narrow together
  filters: filterSchema.array(),
  query: (schema) => schema.max(MESSAGE_MAX_LENGTH),
});
