import type { Room } from "@/schema/rooms";
import type { User } from "@/schema/users";

import { messageSchema } from "@/schema/messageSchema";
import { rooms } from "@/schema/rooms";
import { users } from "@/schema/users";
import { relations } from "drizzle-orm";
import { primaryKey, text, uuid } from "drizzle-orm/pg-core";

export const usersToHuddles = messageSchema.table(
  "users_to_huddles",
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
export type UserToHuddle = typeof usersToHuddles.$inferSelect;

export const usersToHuddlesRelations = relations(usersToHuddles, ({ one }) => ({
  room: one(rooms, {
    fields: [usersToHuddles.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [usersToHuddles.userId],
    references: [users.id],
  }),
}));

export const UserToHuddleRelations = {
  room: true,
  user: true,
} as const;

export type UserToHuddleWithRelations = UserToHuddle & { room: Room; user: User };
