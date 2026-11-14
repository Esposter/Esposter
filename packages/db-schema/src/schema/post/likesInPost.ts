import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { postSchema } from "#src/schema/post/postSchema";
import { postsInPost } from "#src/schema/post/postsInPost";
import { sqliteTable } from "#src/sqliteTable";
import { sql } from "drizzle-orm";
import { check, index, integer, primaryKey, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const likesInPost = sqliteTable(
  "likes",
  {
    postId: text()
      .notNull()
      .references(() => postsInPost.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
    value: integer().notNull(),
  },
  {
    extraConfig: ({ postId, userId, value }) => [
      primaryKey({ columns: [userId, postId] }),
      check("likes_value_check", sql`${value} = 1 OR ${value} = -1`),
      // The primary key leads with userId, so a post's deletion cascading into its likes has no index without this one
      index("likes_postId_index").on(postId),
    ],
    schema: postSchema,
  },
);

export type LikeInPost = typeof likesInPost.$inferSelect;

export const selectLikeInPostSchema = createSelectSchema(likesInPost, {
  postId: () => z.uuidv7(),
  value: z.literal([1, -1]),
});
