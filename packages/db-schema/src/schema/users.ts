import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { accounts } from "@/schema/accounts";
import { blocks } from "@/schema/blocks";
import { friendRequests } from "@/schema/friendRequests";
import { friends } from "@/schema/friends";
import { likes } from "@/schema/likes";
import { posts } from "@/schema/posts";
import { sessions } from "@/schema/sessions";
import { surveys } from "@/schema/surveys";
import { userAchievements } from "@/schema/userAchievements";
import { userStatuses } from "@/schema/userStatuses";
import { usersToRooms } from "@/schema/usersToRooms";
import { relations, sql } from "drizzle-orm";
import { boolean, check, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const USER_BIOGRAPHY_MAX_LENGTH = 160;
export const USER_NAME_MAX_LENGTH = 100;

export const users = pgTable(
  "users",
  {
    biography: text("biography"),
    createdAt: timestamp("created_at").notNull(),
    deletedAt: timestamp("deleted_at"),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    id: text("id").primaryKey(),
    image: text("image"),
    name: text("name").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  ({ biography, name }) => [
    check(
      "biography",
      sql`${biography} IS NULL OR LENGTH(${biography}) <= ${sql.raw(USER_BIOGRAPHY_MAX_LENGTH.toString())}`,
    ),
    check("name", createNameCheckSql(name, USER_NAME_MAX_LENGTH)),
  ],
);

export type User = typeof users.$inferSelect;

export const selectUserSchema = createSelectSchema(users, {
  biography: z.string().max(USER_BIOGRAPHY_MAX_LENGTH).nullable(),
  email: z.email(),
  name: createNameSchema(USER_NAME_MAX_LENGTH),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  blocksAsBlocked: many(blocks, { relationName: "blocked" }),
  blocksAsBlocker: many(blocks, { relationName: "blocker" }),
  likes: many(likes),
  posts: many(posts),
  receivedFriendRequests: many(friendRequests, { relationName: "receiver" }),
  receivedFriends: many(friends, { relationName: "receiver" }),
  sentFriendRequests: many(friendRequests, { relationName: "sender" }),
  sentFriends: many(friends, { relationName: "sender" }),
  sessions: many(sessions),
  surveys: many(surveys),
  userAchievements: many(userAchievements),
  userStatuses: one(userStatuses, {
    fields: [users.id],
    references: [userStatuses.userId],
  }),
  usersToRooms: many(usersToRooms),
}));
