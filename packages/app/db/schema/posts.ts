import type { Like, User } from "@/db/schema/users";

import { likes, users } from "@/db/schema/users";
import { pgTable } from "@/db/shared/pgTable";
import { POST_DESCRIPTION_MAX_LENGTH, POST_TITLE_MAX_LENGTH } from "@/services/post/constants";
import { relations } from "drizzle-orm";
import { doublePrecision, integer, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("Post", {
  creatorId: uuid("creatorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  depth: integer("depth").notNull().default(0),
  description: text("description").notNull().default(""),
  id: uuid("id").primaryKey().defaultRandom(),
  noComments: integer("noComments").notNull().default(0),
  noLikes: integer("noLikes").notNull().default(0),
  parentId: uuid("parentId"),
  ranking: doublePrecision("ranking").notNull(),
  title: text("title").notNull().default(""),
});

export type Post = typeof posts.$inferSelect;
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const PostRelations = {
  creator: true,
  likes: true,
} as const;
export type PostWithRelations = { creator: User; likes: Like[] } & Post;

export const selectPostSchema = createSelectSchema(posts, {
  description: z.string().max(POST_DESCRIPTION_MAX_LENGTH),
  title: z.string().max(POST_TITLE_MAX_LENGTH),
});

export const postsRelations = relations(posts, ({ many, one }) => ({
  creator: one(users, {
    fields: [posts.creatorId],
    references: [users.id],
  }),
  likes: many(likes),
  parent: one(posts, {
    fields: [posts.parentId],
    references: [posts.id],
  }),
}));
