import { pgTable } from "#src/pgTable";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { postSchema } from "#src/schema/post/postSchema";
import { postsInPost } from "#src/schema/post/postsInPost";
import { sql } from "drizzle-orm";
import { check, integer, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const likesInPost = pgTable(
  "likes",
  {
    postId: uuid()
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
    ],
    schema: postSchema,
  },
);

export type LikeInPost = typeof likesInPost.$inferSelect;

export const selectLikeInPostSchema = createSelectSchema(likesInPost, { value: z.literal([1, -1]) });
