import { posts } from "#shared/db/schema/posts";
import { users } from "#shared/db/schema/users";
import { relations, sql } from "drizzle-orm";
import { check, integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const likes = pgTable(
  "likes",
  {
    postId: uuid("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    value: integer("value").notNull(),
  },
  ({ postId, userId, value }) => [
    primaryKey({ columns: [userId, postId] }),
    check("value", sql`${value} = 1 OR ${value} = -1`),
  ],
);

export type Like = typeof likes.$inferSelect;

export const selectLikeSchema = createSelectSchema(likes, {
  value: z.literal([1, -1]),
});

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));
