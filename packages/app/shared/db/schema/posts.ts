import type { Like, User } from "#shared/db/schema/users";

import { pgTable } from "#shared/db/pgTable";
import { likes, users } from "#shared/db/schema/users";
import { POST_DESCRIPTION_MAX_LENGTH, POST_TITLE_MAX_LENGTH } from "#shared/services/post/constants";
import { type } from "arktype";
import { createSelectSchema } from "drizzle-arktype";
import { relations, sql } from "drizzle-orm";
import { check, doublePrecision, integer, text, uuid } from "drizzle-orm/pg-core";

export const posts = pgTable(
  "posts",
  {
    depth: integer("depth").notNull().default(0),
    description: text("description").notNull().default(""),
    id: uuid("id").primaryKey().defaultRandom(),
    noComments: integer("noComments").notNull().default(0),
    noLikes: integer("noLikes").notNull().default(0),
    parentId: uuid("parentId"),
    ranking: doublePrecision("ranking").notNull(),
    title: text("title").notNull().default(""),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  ({ description, title }) => [
    // We don't check if title is min(1) here because posts can be comments that have no title
    check("title", sql`LENGTH(${title}) <= ${sql.raw(POST_TITLE_MAX_LENGTH.toString())}`),
    check("description", sql`LENGTH(${description}) <= ${sql.raw(POST_DESCRIPTION_MAX_LENGTH.toString())}`),
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
  description: (schema) => type.pipe(schema, type.string.atMostLength(POST_DESCRIPTION_MAX_LENGTH)),
  title: (schema) => type.pipe(schema, type.string.moreThanLength(0).atMostLength(POST_TITLE_MAX_LENGTH)),
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
