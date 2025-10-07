import { accounts } from "#shared/db/schema/accounts";
import { likes } from "#shared/db/schema/likes";
import { posts } from "#shared/db/schema/posts";
import { sessions } from "#shared/db/schema/sessions";
import { surveys } from "#shared/db/schema/surveys";
import { userStatuses } from "#shared/db/schema/userStatuses";
import { usersToRooms } from "#shared/db/schema/usersToRooms";
import { USER_NAME_MAX_LENGTH } from "@esposter/shared";
import { relations, sql } from "drizzle-orm";
import { boolean, check, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable(
  "users",
  {
    createdAt: timestamp("created_at").notNull(),
    deletedAt: timestamp("deleted_at"),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    id: text("id").primaryKey(),
    image: text("image"),
    name: text("name").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  ({ name }) => [
    check("name", sql`LENGTH(${name}) >= 1 AND LENGTH(${name}) <= ${sql.raw(USER_NAME_MAX_LENGTH.toString())}`),
  ],
);

export type User = typeof users.$inferSelect;

export const selectUserSchema = createSelectSchema(users, {
  name: z.string().min(1).max(USER_NAME_MAX_LENGTH),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  likes: many(likes),
  posts: many(posts),
  sessions: many(sessions),
  surveys: many(surveys),
  userStatuses: one(userStatuses, {
    fields: [users.id],
    references: [userStatuses.userId],
  }),
  usersToRooms: many(usersToRooms),
}));
