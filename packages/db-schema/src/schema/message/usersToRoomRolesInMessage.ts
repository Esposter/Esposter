import { messageSchema } from "#src/schema/message/messageSchema";
import { roomRolesInMessage } from "#src/schema/message/roomRolesInMessage";
import { usersToRoomsInMessage } from "#src/schema/message/usersToRoomsInMessage";
import { createRoomUserColumns } from "#src/services/message/createRoomUserColumns";
import { createTombstoneIndex } from "#src/services/tombstone/createTombstoneIndex";
import { sqliteTable } from "#src/sqliteTable";
import { foreignKey, index, primaryKey, text } from "drizzle-orm/sqlite-core";

export const usersToRoomRolesInMessage = sqliteTable(
  "usersToRoomRoles",
  {
    roleId: text()
      .notNull()
      .references(() => roomRolesInMessage.id, { onDelete: "cascade" }),
    ...createRoomUserColumns(),
  },
  {
    extraConfig: ({ deletedAt, roleId, roomId, userId }) => [
      primaryKey({ columns: [userId, roomId, roleId] }),
      foreignKey({
        columns: [userId, roomId],
        foreignColumns: [usersToRoomsInMessage.userId, usersToRoomsInMessage.roomId],
      }).onDelete("cascade"),
      index("usersToRoomRoles_roleId_index").on(roleId),
      // Serves a room's role rows in the order the top-role query walks them (a window partitioned by userId).
      // It also serves a room filter on its own, so the single-column room index it replaces is a prefix of this one
      index("usersToRoomRoles_roomId_userId_index").on(roomId, userId),
      createTombstoneIndex("usersToRoomRoles", deletedAt),
    ],
    schema: messageSchema,
    scope: { columns: ["roomId", "userId"] },
  },
);

export type UserToRoomRoleInMessage = typeof usersToRoomRolesInMessage.$inferSelect;
