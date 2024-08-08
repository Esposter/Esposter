import { accounts } from "@/db/schema/accounts";
import { posts } from "@/db/schema/posts";
import { rooms } from "@/db/schema/rooms";
import { sessions } from "@/db/schema/sessions";
import { surveys } from "@/db/schema/surveys";
import { pgTable } from "@/db/shared/pgTable";
import { USER_NAME_MAX_LENGTH } from "@/services/user/constants";
import { relations } from "drizzle-orm";
import { integer, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("User", {
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  id: uuid("id").primaryKey().defaultRandom(),
  image: text("image"),
  name: text("name"),
});

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
  "UserToRoom",
  {
    roomId: uuid("roomId")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (userToRoom) => ({
    compoundKey: primaryKey({ columns: [userToRoom.userId, userToRoom.roomId] }),
  }),
);
export type UserToRoom = typeof usersToRooms.$inferSelect;

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
  "Like",
  {
    postId: uuid("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // @TODO: Check constraint of values 1 or -1 when drizzle implements this
    // and remove all options from createSelectSchema as db should be our source of truth
    // https://github.com/drizzle-team/drizzle-orm/issues/880
    value: integer("value").notNull(),
  },
  (like) => ({
    compoundKey: primaryKey({ columns: [like.userId, like.postId] }),
  }),
);

export type Like = typeof likes.$inferSelect;

export const selectLikeSchema = createSelectSchema(likes, {
  value: z
    .number()
    .int()
    .refine((value) => value === 1 || value === -1)
    .innerType(),
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
