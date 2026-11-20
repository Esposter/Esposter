/* oxlint-disable no-await-in-loop -- Bounded concurrency: one room at a time, as the sibling sweeps walk them */
import type { UserInAuth } from "@esposter/db-schema";

import { getRoomObject } from "#src/services/room/getRoomObject";
import { getDb } from "#src/services/shared/getDb";
import { getMemberRoomIds } from "@esposter/db";
import { getLiveMembershipWhere, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// The account is taken out of each room it is still a member of before its row goes.
// Each membership is tombstoned first, so the `leaveRoom` the room sends carries the row at the version the removal left,
// And a list holding it drops the row by that version.
// The room drops its sockets and its online set first, then every member it still has online is sent that `leaveRoom`.
// So an open room hears of the erase rather than finding the account gone at its next reload.
// The rooms it owned went first, so the memberships left are the rooms it is still in
export const removeAccountFromMemberRooms = async (userId: UserInAuth["id"]): Promise<void> => {
  const db = getDb();
  const memberRoomIds = await getMemberRoomIds(db, userId);
  for (const roomId of memberRoomIds) {
    const [removedMembership] = await db
      .update(usersToRoomsInMessage)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(usersToRoomsInMessage.roomId, roomId),
          eq(usersToRoomsInMessage.userId, userId),
          getLiveMembershipWhere(usersToRoomsInMessage),
        ),
      )
      .returning();
    const roomObject = getRoomObject(roomId);
    await roomObject.removeMember(userId);
    if (removedMembership)
      await roomObject.notifyOnlineMembers({
        data: {
          deletedAt: removedMembership.deletedAt,
          displayName: removedMembership.displayName,
          roomId,
          userId,
          version: removedMembership.version,
        },
        type: "leaveRoom",
      });
  }
};
