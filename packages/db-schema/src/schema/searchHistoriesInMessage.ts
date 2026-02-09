import type { Filter } from "@/models/message/filter/Filter";

import { MESSAGE_MAX_LENGTH } from "@/models/message/BaseMessageEntity";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, jsonb, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const searchHistoriesInMessage = pgTable(
  "search_histories",
  {
    filters: jsonb("filters").notNull().$type<Filter[]>().default([]),
    id: uuid("id").primaryKey().defaultRandom(),
    query: text("query").notNull().default(""),
    roomId: uuid("room_id")
      .notNull()
      .references(() => roomsInMessage.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
  },
  {
    extraConfig: ({ query }) => [check("query", sql`LENGTH(${query}) <= ${sql.raw(MESSAGE_MAX_LENGTH.toString())}`)],
    schema: messageSchema,
  },
);

export type SearchHistoryInMessage = typeof searchHistoriesInMessage.$inferSelect;

export const selectSearchHistoryInMessageSchema = createSelectSchema(searchHistoriesInMessage, {
  query: z.string().max(MESSAGE_MAX_LENGTH),
});
