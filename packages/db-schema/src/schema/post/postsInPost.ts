import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";

import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { postSchema } from "#src/schema/post/postSchema";
import { POST_DESCRIPTION_MAX_LENGTH, POST_TITLE_MAX_LENGTH } from "#src/services/post/constants";
import { createPostDescriptionSchema } from "#src/services/post/createPostDescriptionSchema";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { createNameSchema } from "#src/services/shared/createNameSchema";
import { sqliteTable } from "#src/sqliteTable";
import { sql } from "drizzle-orm";
import { check, index, integer, real, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { v7 } from "uuid";
import { z } from "zod";

export const postsInPost = sqliteTable(
  "posts",
  {
    // Every post above this one, root first. Both writes a reply forces are questions about that chain — which
    // Counters move, and how many rows a delete takes with it — and holding it on the row answers both with an
    // Ordinary predicate rather than a walk down a level at a time. Held as a JSON array, as SQLite has no array type
    ancestorIds: text({ mode: "json" }).$type<string[]>().notNull().default([]),
    commentCount: integer().notNull().default(0),
    depth: integer().notNull().default(0),
    description: text().notNull().default(""),
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    likeCount: integer().notNull().default(0),
    parentId: text().references((): AnySQLiteColumn => postsInPost.id, { onDelete: "cascade" }),
    ranking: real().notNull(),
    title: text().notNull().default(""),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ commentCount, description, parentId, title, userId }) => [
      // No min(1): a post may be a comment, which has no title
      check("posts_title_length_check", createMaxLengthCheckSql(title, POST_TITLE_MAX_LENGTH)),
      check("posts_description_length_check", createMaxLengthCheckSql(description, POST_DESCRIPTION_MAX_LENGTH)),
      // A count is the number of replies the server has counted, which no write takes below zero
      check("posts_commentCount_check", createMinimumCheckSql(commentCount, 0)),
      // A foreign key gets no index of its own in SQLite, and every read of a thread asks this one question:
      // One parent's children, best first. The feed asks it too — a root post is the parent that is null
      index("posts_parentId_ranking_index").on(parentId, sql`"ranking" DESC`, sql`"id" DESC`),
      // The same feed order for one author's posts, which readPosts filters by, and the index a user's deletion cascades
      // Through: a foreign key gets no index of its own in SQLite
      index("posts_userId_ranking_index").on(userId, sql`"ranking" DESC`, sql`"id" DESC`),
    ],
    schema: postSchema,
  },
);

export type PostInPost = typeof postsInPost.$inferSelect;

export const selectPostInPostSchema = createSelectSchema(postsInPost, {
  ancestorIds: () => z.array(z.uuidv4()),
  description: (schema) => createPostDescriptionSchema(schema, 0),
  id: () => z.uuidv4(),
  parentId: () => z.uuidv4(),
  title: (schema) => createNameSchema(POST_TITLE_MAX_LENGTH, schema),
});
export const selectCommentInPostSchema = createSelectSchema(postsInPost, {
  ancestorIds: () => z.array(z.uuidv4()),
  description: (schema) => createPostDescriptionSchema(schema, 1),
  id: () => z.uuidv4(),
  parentId: () => z.uuidv4(),
});
