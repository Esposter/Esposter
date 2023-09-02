import { users } from "@/db/schema/users";
import { pgTable } from "@/db/shared/pgTable";
import { relations } from "drizzle-orm";
import { doublePrecision, integer, text, uuid } from "drizzle-orm/pg-core";

export const posts = pgTable("Post", {
  id: uuid("userId").primaryKey(),
  creatorId: text("creatorId").references(() => users.id),
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  noLikes: integer("noLikes").notNull().default(0),
  noComments: integer("noComments").notNull().default(0),
  ranking: doublePrecision("ranking").notNull(),
});

export const postsRelations = relations(posts, ({ one }) => ({
  creator: one(users, {
    fields: [posts.creatorId],
    references: [users.id],
  }),
}));
