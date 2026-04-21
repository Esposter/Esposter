import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomRoles } from "@/schema/roomRoles";
import { rooms } from "@/schema/rooms";
import { users } from "@/schema/users";
import { relations } from "drizzle-orm";
import { index, primaryKey, text, uuid } from "drizzle-orm/pg-core";

export const usersToRoomRoles = pgTable(
  "users_to_room_roles",
  {
    roleId: uuid("roleId")
      .notNull()
      .references(() => roomRoles.id, { onDelete: "cascade" }),
    roomId: uuid("roomId")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ roleId, roomId, userId }) => [
      primaryKey({ columns: [userId, roomId, roleId] }),
      index("users_to_room_roles_roleId_index").on(roleId),
      index("users_to_room_roles_roomId_index").on(roomId),
    ],
    schema: messageSchema,
  },
);

export type UserToRoomRole = typeof usersToRoomRoles.$inferSelect;

export const usersToRoomRolesRelations = relations(usersToRoomRoles, ({ one }) => ({
  role: one(roomRoles, {
    fields: [usersToRoomRoles.roleId],
    references: [roomRoles.id],
  }),
  room: one(rooms, {
    fields: [usersToRoomRoles.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [usersToRoomRoles.userId],
    references: [users.id],
  }),
}));
