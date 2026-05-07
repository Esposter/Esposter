import type { Filter } from "@/models/message/filter/Filter";

import { MESSAGE_MAX_LENGTH } from "@/models/message/BaseMessageEntity";
import { filterSchema } from "@/models/message/filter/Filter";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, jsonb, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

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
      check("search_histories_query_length_check", sql`LENGTH(${query}) <= ${sql.raw(MESSAGE_MAX_LENGTH.toString())}`),
    ],
    schema: messageSchema,
  },
);

export type SearchHistoryInMessage = typeof searchHistoriesInMessage.$inferSelect;

export const selectSearchHistoryInMessageSchema = createSelectSchema(searchHistoriesInMessage, {
  filters: z.array(filterSchema),
  query: (schema) => schema.max(MESSAGE_MAX_LENGTH),
});
