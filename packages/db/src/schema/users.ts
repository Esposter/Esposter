import { accounts } from "@/schema/accounts";
import { likes } from "@/schema/likes";
import { posts } from "@/schema/posts";
import { sessions } from "@/schema/sessions";
import { surveys } from "@/schema/surveys";
import { userStatuses } from "@/schema/userStatuses";
import { usersToRooms } from "@/schema/usersToRooms";
import { relations, sql } from "drizzle-orm";
import { boolean, check, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const USER_NAME_MAX_LENGTH = 100;

export enum UserType {
  App = "App",
  Human = "Human",
}

export const userTypeEnum = pgEnum("user_type", UserType);

export const users = pgTable(
  "users",
  {
    createdAt: timestamp("created_at").notNull(),
    deletedAt: timestamp("deleted_at"),
    email: text("email").unique(),
    emailVerified: boolean("email_verified"),
    id: text("id").primaryKey(),
    image: text("image"),
    name: text("name").notNull(),
    type: userTypeEnum("type").notNull().default(UserType.Human),
    updatedAt: timestamp("updated_at").notNull(),
  },
  ({ name }) => [
    check("name", sql`LENGTH(${name}) >= 1 AND LENGTH(${name}) <= ${sql.raw(USER_NAME_MAX_LENGTH.toString())}`),
  ],
);

export type User = typeof users.$inferSelect;

export const selectUserSchema = createSelectSchema(users, {
  name: z.string().min(1).max(USER_NAME_MAX_LENGTH),
  type: z.enum(UserType),
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
