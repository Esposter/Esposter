import type { Room } from "#shared/db/schema/rooms";

import { accounts } from "#shared/db/schema/accounts";
import { posts } from "#shared/db/schema/posts";
import { rooms } from "#shared/db/schema/rooms";
import { sessions } from "#shared/db/schema/sessions";
import { surveys } from "#shared/db/schema/surveys";
import { USER_NAME_MAX_LENGTH } from "#shared/services/user/constants";
import { relations, sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

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

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  likes: many(likes),
  posts: many(posts),
  sessions: many(sessions),
  surveys: many(surveys),
  usersToRooms: many(usersToRooms),
}));

export const usersToRooms = pgTable(
  "users_to_rooms",
  {
    roomId: uuid("roomId")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  ({ roomId, userId }) => [primaryKey({ columns: [userId, roomId] })],
);
export type UserToRoom = typeof usersToRooms.$inferSelect;
export const UserToRoomRelations = {
  room: true,
  user: true,
} as const;
export type UserToRoomWithRelations = UserToRoom & { room: Room; user: User };

export const usersToRoomsRelations = relations(usersToRooms, ({ one }) => ({
  room: one(rooms, {
    fields: [usersToRooms.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [usersToRooms.userId],
    references: [users.id],
  }),
}));

export const likes = pgTable(
  "likes",
  {
    postId: uuid("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    value: integer("value").notNull(),
  },
  ({ postId, userId, value }) => [
    primaryKey({ columns: [userId, postId] }),
    check("value", sql`${value} = 1 OR ${value} = -1`),
  ],
);

export type Like = typeof likes.$inferSelect;

export const selectLikeSchema = createSelectSchema(likes, {
  value: z.literal([1, -1]),
});

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));
