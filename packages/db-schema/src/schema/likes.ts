import { pgTable } from "@/pgTable";
import { posts } from "@/schema/posts";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, integer, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const likes = pgTable(
  "likes",
  {
    postId: uuid()
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    value: integer().notNull(),
  },
  {
    extraConfig: ({ postId, userId, value }) => [
      primaryKey({ columns: [userId, postId] }),
      check("likes_value_check", sql`${value} = 1 OR ${value} = -1`),
    ],
  },
);

export type Like = typeof likes.$inferSelect;

export const selectLikeSchema = createSelectSchema(likes, {
  value: z.literal([1, -1]),
});
