import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { usersToRoomsInMessage } from "#src/schema/message/usersToRoomsInMessage";
import { sql } from "drizzle-orm";
import { bigint, check, foreignKey, index, primaryKey, text, uuid } from "drizzle-orm/pg-core";

// One member's overrides in one room. `allow` and `deny` are two bitfields because an override has three states
// Per permission — allowed, denied, or left to the roles — and one field can carry only two. A bit set in both
// Would be a fourth state nothing designed, so the CHECK below holds them disjoint
export const roomMemberPermissionsInMessage = pgTable(
  "roomMemberPermissions",
  {
    allow: bigint({ mode: "bigint" }).notNull().default(0n),
    deny: bigint({ mode: "bigint" }).notNull().default(0n),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    userId: text().notNull(),
  },
  {
    extraConfig: ({ allow, deny, roomId, userId }) => [
      primaryKey({ columns: [userId, roomId] }),
      foreignKey({
        columns: [userId, roomId],
        foreignColumns: [usersToRoomsInMessage.userId, usersToRoomsInMessage.roomId],
      }).onDelete("cascade"),
      check("roomMemberPermissions_allow_deny_disjoint_check", sql`(${allow} & ${deny}) = 0`),
      // The primary key leads with userId, so a room's overrides have no index of their own without this one
      index("roomMemberPermissions_roomId_index").on(roomId),
    ],
    schema: messageSchema,
  },
);

export type RoomMemberPermissionInMessage = typeof roomMemberPermissionsInMessage.$inferSelect;
