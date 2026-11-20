import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";

import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { roomMemberPermissionsInMessage, usersToRoomRolesInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// The statements that remove one member from one room, for the caller to batch. The membership stays as a tombstone, so
// Its version rises and a late arrival of the row loses to the removal. The roles and overrides it held are deleted in
// The same batch, since a hard delete used to cascade to them and a revival would otherwise hand them back. The first
// Statement is the membership, and `extraWhere` guards every one of them
export const getRoomMembershipRemoval = (db: Context["db"], roomId: string, userId: string, extraWhere?: SQL) => {
  const memberWhere = and(eq(usersToRoomRolesInMessage.roomId, roomId), eq(usersToRoomRolesInMessage.userId, userId));
  return [
    db
      .update(usersToRoomsInMessage)
      .set({ deletedAt: new Date() })
      .where(and(getRoomMembershipWhere(roomId, userId), extraWhere))
      .returning(),
    db.delete(usersToRoomRolesInMessage).where(and(memberWhere, extraWhere)),
    db
      .delete(roomMemberPermissionsInMessage)
      .where(
        and(
          eq(roomMemberPermissionsInMessage.roomId, roomId),
          eq(roomMemberPermissionsInMessage.userId, userId),
          extraWhere,
        ),
      ),
  ] as const;
};
