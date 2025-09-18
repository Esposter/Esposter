import type { Filter } from "#shared/models/message/Filter";

import { pgTable } from "#shared/db/pgTable";
import { messageSchema } from "#shared/db/schema/messageSchema";
import { rooms } from "#shared/db/schema/rooms";
import { users } from "#shared/db/schema/users";
import { MESSAGE_MAX_LENGTH } from "#shared/services/message/constants";
import { relations, sql } from "drizzle-orm";
import { check, jsonb, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const searchHistories = pgTable(
  "search_history",
  {
    filters: jsonb("filters").notNull().$type<Filter[]>().default([]),
    id: uuid("id").primaryKey().defaultRandom(),
    query: text("query").notNull().default(""),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
  },
  {
    extraConfig: ({ query }) => [check("query", sql`LENGTH(${query}) <= ${sql.raw(MESSAGE_MAX_LENGTH.toString())}`)],
    schema: messageSchema,
  },
);

export type SearchHistory = typeof searchHistories.$inferSelect;

export const selectSearchHistorySchema = createSelectSchema(searchHistories, {
  query: z.string().max(MESSAGE_MAX_LENGTH),
});

export const searchHistoriesRelations = relations(searchHistories, ({ one }) => ({
  room: one(rooms, {
    fields: [searchHistories.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [searchHistories.userId],
    references: [users.id],
  }),
}));
