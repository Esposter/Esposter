/* oxlint-disable no-await-in-loop -- Bounded concurrency: one room at a time, as the sibling sweeps walk them */
import type { UserInAuth } from "@esposter/db-schema";

import { getRoomObject } from "#src/services/room/getRoomObject";
import { getDb } from "#src/services/shared/getDb";
import { getMemberRoomIds } from "@esposter/db";
import { getLiveRowWhere, usersToRoomsInMessage } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

// The account is taken out of each room it is still a member of before its row goes. Each membership is tombstoned
// First, so the `leaveRoom` the room sends carries the row at the version the removal left, and a list holding it drops
// The row by that version. The room drops its sockets and its online set first, then every member it still has online
// Is sent that `leaveRoom`. So an open room hears of the erase rather than finding the account gone at its next reload.
// The rooms it owned went first, so the memberships left are the rooms it is still in. Each room's two calls are
// Best-effort, as announceRoomMemberDeparture makes them: a failure is logged and the sweep goes on to the next room,
// So one room cannot hold the others back. A failed room is not revisited, since its membership is tombstoned
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
          getLiveRowWhere(usersToRoomsInMessage),
        ),
      )
      .returning();
    const roomObject = getRoomObject(roomId);
    await getResultAsync(() => roomObject.removeMember(userId)).match(noop, (error) => {
      console.error("An erased account's room state failed to clear", { error, roomId, userId });
    });
    if (removedMembership)
      await getResultAsync(() =>
        roomObject.notifyOnlineMembers({
          data: {
            deletedAt: removedMembership.deletedAt,
            displayName: removedMembership.displayName,
            roomId,
            userId,
            version: removedMembership.version,
          },
          type: "leaveRoom",
        }),
      ).match(noop, (error) => {
        console.error("An erased account's departure failed to reach a room's online members", {
          error,
          roomId,
          userId,
        });
      });
  }
};
