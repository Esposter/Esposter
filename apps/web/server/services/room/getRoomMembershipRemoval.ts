import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";

import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import {
  getLiveRowWhere,
  roomMemberPermissionsInMessage,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// The statements that remove one member from one room, for the caller to batch. The membership stays as a tombstone, so
// Its version rises and a late arrival of the row loses to the removal. The roles and overrides it held are tombstoned in
// The same batch, so a client holding them sees the removal, and a later grant of the same role revives its own row. The
// First statement is the membership, and `extraWhere` guards every one of them
export const getRoomMembershipRemoval = (db: Context["db"], roomId: string, userId: string, extraWhere?: SQL) => {
  const memberRoleWhere = and(
    eq(usersToRoomRolesInMessage.roomId, roomId),
    eq(usersToRoomRolesInMessage.userId, userId),
    getLiveRowWhere(usersToRoomRolesInMessage),
  );
  return [
    db
      .update(usersToRoomsInMessage)
      .set({ deletedAt: new Date() })
      .where(and(getRoomMembershipWhere(roomId, userId), extraWhere))
      .returning(),
    db.update(usersToRoomRolesInMessage).set({ deletedAt: new Date() }).where(and(memberRoleWhere, extraWhere)),
    db
      .update(roomMemberPermissionsInMessage)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(roomMemberPermissionsInMessage.roomId, roomId),
          eq(roomMemberPermissionsInMessage.userId, userId),
          getLiveRowWhere(roomMemberPermissionsInMessage),
          extraWhere,
        ),
      ),
  ] as const;
};
