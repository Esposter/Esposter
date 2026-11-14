import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { usersToRoomsInMessage } from "#src/schema/message/usersToRoomsInMessage";
import { createBitfieldColumn } from "#src/services/shared/createBitfieldColumn";
import { sqliteTable } from "#src/sqliteTable";
import { foreignKey, index, primaryKey, text } from "drizzle-orm/sqlite-core";

// One member's overrides in one room. `allow` and `deny` are two bitfields because an override has three states
// Per permission — allowed, denied, or left to the roles — and one field can carry only two. A bit set in both
// Would be a fourth state nothing designed. No CHECK holds them disjoint: the bits are read and merged in JS, and
// `setMemberPermissionOverride` is the one writer, which moves a bit between the two rather than setting it in both
export const roomMemberPermissionsInMessage = sqliteTable(
  "roomMemberPermissions",
  {
    allow: createBitfieldColumn(),
    deny: createBitfieldColumn(),
    roomId: text()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    userId: text().notNull(),
  },
  {
    extraConfig: ({ roomId, userId }) => [
      primaryKey({ columns: [userId, roomId] }),
      foreignKey({
        columns: [userId, roomId],
        foreignColumns: [usersToRoomsInMessage.userId, usersToRoomsInMessage.roomId],
      }).onDelete("cascade"),
      // The primary key leads with userId, so a room's overrides have no index of their own without this one
      index("roomMemberPermissions_roomId_index").on(roomId),
    ],
    schema: messageSchema,
  },
);

export type RoomMemberPermissionInMessage = typeof roomMemberPermissionsInMessage.$inferSelect;
