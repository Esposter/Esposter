import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomRolesInMessage } from "#src/schema/message/roomRolesInMessage";
import { usersToRoomsInMessage } from "#src/schema/message/usersToRoomsInMessage";
import { createRoomUserColumns } from "#src/services/message/createRoomUserColumns";
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
      // Serves a room's role rows in the order the top-role query walks them (DISTINCT ON userId), and a room filter on
      // Its own, so the single-column room index it replaces is a prefix of this one
      index("usersToRoomRoles_roomId_userId_index").on(roomId, userId),
    ],
    schema: messageSchema,
  },
);

export type UserToRoomRoleInMessage = typeof usersToRoomRolesInMessage.$inferSelect;
