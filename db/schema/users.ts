import { accounts } from "@/db/schema/accounts";
import { posts } from "@/db/schema/posts";
import { rooms } from "@/db/schema/rooms";
import { sessions } from "@/db/schema/sessions";
import { pgTable } from "@/db/shared/pgTable";
import { USER_NAME_MAX_LENGTH } from "@/services/user/constants";
import { relations } from "drizzle-orm";
import { integer, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("User", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export type User = typeof users.$inferSelect;

export const selectUserSchema = createSelectSchema(users, {
  id: z.string().cuid(),
  name: z.string().min(1).max(USER_NAME_MAX_LENGTH),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  likes: many(likes),
  posts: many(posts),
  usersToRooms: many(usersToRooms),
}));

export const usersToRooms = pgTable(
  "UserToRoom",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roomId: uuid("roomId")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
  },
  (userToRoom) => ({
    compoundKey: primaryKey(userToRoom.userId, userToRoom.roomId),
  }),
);

export const usersToRoomsRelations = relations(usersToRooms, ({ one }) => ({
  user: one(users, {
    fields: [usersToRooms.userId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [usersToRooms.roomId],
    references: [rooms.id],
  }),
}));

export const likes = pgTable(
  "Like",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: uuid("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    // @NOTE: Check constraint of values 1 or -1 when drizzle implements this
    // and remove all options from createSelectSchema as db should be our source of truth
    value: integer("value").notNull(),
  },
  (like) => ({
    compoundKey: primaryKey(like.userId, like.postId),
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
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
}));
