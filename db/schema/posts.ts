import type { Like, User } from "@/db/schema/users";
import { users } from "@/db/schema/users";
import { pgTable } from "@/db/shared/pgTable";
import { relations } from "drizzle-orm";
import { doublePrecision, integer, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("Post", {
  id: uuid("userId").primaryKey(),
  creatorId: text("creatorId")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  noLikes: integer("noLikes").notNull().default(0),
  noComments: integer("noComments").notNull().default(0),
  ranking: doublePrecision("ranking").notNull(),
});

export type Post = typeof posts.$inferSelect;
// @NOTE: https://github.com/drizzle-team/drizzle-orm/issues/695
export type PostWithRelations = Post & { creator: User; likes: Like[] };

export const selectPostSchema = createSelectSchema(posts, {
  title: z.string().min(1).max(POST_TITLE_MAX_LENGTH),
  description: z.string().max(POST_DESCRIPTION_MAX_LENGTH),
  noLikes: z.number().int().nonnegative(),
  noComments: z.number().int().nonnegative(),
});

export const postsRelations = relations(posts, ({ one }) => ({
  creator: one(users, {
    fields: [posts.creatorId],
    references: [users.id],
  }),
}));
