import type { Like } from "@/schema/likes";
import type { User } from "@/schema/users";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, doublePrecision, integer, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const POST_TITLE_MAX_LENGTH = 300;
export const POST_DESCRIPTION_MAX_LENGTH = 1000;

export const posts = pgTable(
  "posts",
  {
    depth: integer("depth").notNull().default(0),
    description: text("description").notNull().default(""),
    id: uuid("id").primaryKey().defaultRandom(),
    noComments: integer("noComments").notNull().default(0),
    noLikes: integer("noLikes").notNull().default(0),
    parentId: uuid("parentId").references((): AnyPgColumn => posts.id, { onDelete: "cascade" }),
    ranking: doublePrecision("ranking").notNull(),
    title: text("title").notNull().default(""),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ description, title }) => [
      // We don't check if title is min(1) here because posts can be comments that have no title
      check("title", sql`LENGTH(${title}) <= ${sql.raw(POST_TITLE_MAX_LENGTH.toString())}`),
      check("description", sql`LENGTH(${description}) <= ${sql.raw(POST_DESCRIPTION_MAX_LENGTH.toString())}`),
    ],
  },
);

export type Post = typeof posts.$inferSelect;

export const selectPostSchema = createSelectSchema(posts, {
  description: z.string().max(POST_DESCRIPTION_MAX_LENGTH),
  title: z.string().min(1).max(POST_TITLE_MAX_LENGTH),
});
export const selectCommentSchema = createSelectSchema(posts, {
  description: z.string().min(1).max(POST_DESCRIPTION_MAX_LENGTH),
});

// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const PostRelations = {
  likes: true,
  user: true,
} as const;
export type PostWithRelations = Post & { likes: Like[]; user: User };
