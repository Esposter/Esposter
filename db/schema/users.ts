import { posts } from "@/db/schema/posts";
import { rooms } from "@/db/schema/rooms";
import { pgTable } from "@/db/shared/pgTable";
import { relations } from "drizzle-orm";
import { integer, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("User", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const usersRelations = relations(users, ({ many }) => ({
  rooms: many(rooms),
  posts: many(posts),
  likes: many(likes),
}));

export const usersToRooms = pgTable(
  "UserToRoom",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id),
    roomId: uuid("roomId")
      .notNull()
      .references(() => rooms.id),
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
      .references(() => users.id),
    postId: uuid("postId")
      .notNull()
      .references(() => rooms.id),
    // @NOTE: Check constraint of values 1 or -1
    value: integer("value"),
  },
  (like) => ({
    compoundKey: primaryKey(like.userId, like.postId),
  }),
);

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
