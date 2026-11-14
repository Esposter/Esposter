/* oxlint-disable no-await-in-loop -- Bounded concurrency: one room at a time, as the sibling sweeps walk them */
import type { UserInAuth } from "@esposter/db-schema";

import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { getRoomObject } from "#src/services/room/getRoomObject";

// The account is taken out of each room it is still a member of before its row goes.
// The room drops its sockets and its online set first, then every member it still has online is sent the
// `leaveRoom` that prunes the account from their list.
// So an open room hears of the erase rather than finding the account gone at its next reload.
// The rooms it owned went first, so the memberships left are the rooms it is still in
export const removeAccountFromMemberRooms = async (userId: UserInAuth["id"]): Promise<void> => {
  const memberRoomIds = await getAccountMemberRoomIds(userId);
  for (const roomId of memberRoomIds) {
    const roomObject = getRoomObject(roomId);
    await roomObject.removeMember(userId);
    await roomObject.notifyOnlineMembers({ data: { roomId, userId }, type: "leaveRoom" });
  }
};
