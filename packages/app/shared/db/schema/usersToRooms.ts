import type { Room } from "#shared/db/schema/rooms";
import type { User } from "#shared/db/schema/users";

import { rooms } from "#shared/db/schema/rooms";
import { users } from "#shared/db/schema/users";
import { relations } from "drizzle-orm";
import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

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
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const UserToRoomRelations = {
  room: true,
  user: true,
} as const;
export type UserToRoomWithRelations = UserToRoom & { room: Room; user: User };
