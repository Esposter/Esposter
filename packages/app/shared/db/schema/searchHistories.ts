import { pgTable } from "#shared/db/pgTable";
import { users } from "#shared/db/schema/users";
import { MESSAGE_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { relations, sql } from "drizzle-orm";
import { check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const searchHistories = pgTable(
  "search_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    query: text("query").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
  },
  ({ query }) => [
    check("query", sql`LENGTH(${query}) >= 1 AND LENGTH(${query}) <= ${sql.raw(MESSAGE_MAX_LENGTH.toString())}`),
  ],
);

export type SearchHistory = typeof searchHistories.$inferSelect;

export const selectSearchHistorySchema = createSelectSchema(searchHistories, {
  query: z.string().min(1).max(MESSAGE_MAX_LENGTH),
});

export const searchHistoriesRelations = relations(searchHistories, ({ one }) => ({
  user: one(users, {
    fields: [searchHistories.userId],
    references: [users.id],
  }),
}));
