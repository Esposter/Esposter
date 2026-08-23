import type { RoomRoleInMessage } from "#src/schema/roomRolesInMessage";

import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { roomRolesInMessage } from "#src/schema/roomRolesInMessage";
import { roomsInMessage } from "#src/schema/roomsInMessage";
import { users } from "#src/schema/users";
import { usersToRoomsInMessage } from "#src/schema/usersToRoomsInMessage";
import { foreignKey, index, primaryKey, text, uuid } from "drizzle-orm/pg-core";

export const usersToRoomRolesInMessage = pgTable(
  "usersToRoomRoles",
  {
    roleId: uuid()
      .notNull()
      .references(() => roomRolesInMessage.id, { onDelete: "cascade" }),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    userId: text()
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
      index("usersToRoomRoles_roleId_index").on(roleId),
      index("usersToRoomRoles_roomId_index").on(roomId),
    ],
    schema: messageSchema,
  },
);

export type UserToRoomRoleInMessage = typeof usersToRoomRolesInMessage.$inferSelect;
export type UserToRoomRoleInMessageWithRelations = UserToRoomRoleInMessage & { role: RoomRoleInMessage };
