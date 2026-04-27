import type { RoomRoleInMessage } from "@/schema/roomRolesInMessage";

import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomRolesInMessage } from "@/schema/roomRolesInMessage";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { usersToRoomsInMessage } from "@/schema/usersToRoomsInMessage";
import { foreignKey, index, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const usersToRoomRolesInMessage = pgTable(
  "users_to_room_roles",
  {
    roleId: uuid("roleId")
      .notNull()
      .references(() => roomRolesInMessage.id, { onDelete: "cascade" }),
    roomId: uuid("roomId")
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ roleId, roomId, userId }) => [
      primaryKey({ columns: [userId, roomId, roleId] }),
      foreignKey({
        columns: [userId, roomId],
        foreignColumns: [usersToRoomsInMessage.userId, usersToRoomsInMessage.roomId],
      }).onDelete("cascade"),
      index("users_to_room_roles_roleId_index").on(roleId),
      index("users_to_room_roles_roomId_index").on(roomId),
    ],
    schema: messageSchema,
  },
);

export type UserToRoomRoleInMessage = typeof usersToRoomRolesInMessage.$inferSelect;
export type UserToRoomRoleInMessageWithRelations = UserToRoomRoleInMessage & { role: RoomRoleInMessage };

export const selectUserToRoomRoleInMessageSchema = createSelectSchema(usersToRoomRolesInMessage);
