import type { Like, User } from "#shared/db/schema/users";

import { pgTable } from "#shared/db/pgTable";
import { likes, users } from "#shared/db/schema/users";
import { POST_DESCRIPTION_MAX_LENGTH, POST_TITLE_MAX_LENGTH } from "#shared/services/post/constants";
import { relations, sql } from "drizzle-orm";
import { check, doublePrecision, integer, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable(
  "Post",
  {
    depth: integer("depth").notNull().default(0),
    description: text("description").notNull().default(""),
    id: uuid("id").primaryKey().defaultRandom(),
    noComments: integer("noComments").notNull().default(0),
    noLikes: integer("noLikes").notNull().default(0),
    parentId: uuid("parentId"),
    ranking: doublePrecision("ranking").notNull(),
    title: text("title").notNull().default(""),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  ({ description, title }) => [
    check("title", sql`LENGTH(${title}) >= 1 AND LENGTH(${title}) <= ${POST_TITLE_MAX_LENGTH}`),
    check("description", sql`LENGTH(${description}) <= ${POST_DESCRIPTION_MAX_LENGTH}`),
  ],
);

export type Post = typeof posts.$inferSelect;
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const PostRelations = {
  likes: true,
  user: true,
} as const;
export type PostWithRelations = Post & { likes: Like[]; user: User };

export const selectPostSchema = createSelectSchema(posts, {
  description: z.string().max(POST_DESCRIPTION_MAX_LENGTH),
  title: z.string().min(1).max(POST_TITLE_MAX_LENGTH),
});

export const postsRelations = relations(posts, ({ many, one }) => ({
  likes: many(likes),
  parent: one(posts, {
    fields: [posts.parentId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));
