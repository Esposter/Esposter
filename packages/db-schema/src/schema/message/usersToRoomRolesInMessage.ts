import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomRolesInMessage } from "#src/schema/message/roomRolesInMessage";
import { createRoomUserColumns } from "#src/schema/message/roomUserColumns";
import { usersToRoomsInMessage } from "#src/schema/message/usersToRoomsInMessage";
import { foreignKey, index, primaryKey, uuid } from "drizzle-orm/pg-core";

export const usersToRoomRolesInMessage = pgTable(
  "usersToRoomRoles",
  {
    roleId: uuid()
      .notNull()
      .references(() => roomRolesInMessage.id, { onDelete: "cascade" }),
    ...createRoomUserColumns(),
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
