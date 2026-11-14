import type { UserInAuth } from "@esposter/db-schema";

import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { getRoomObject } from "#src/services/room/getRoomObject";

// The reactions the account is on in each room it is a member of.
// Each room takes the account off the emoji's reactors, and the reaction goes when the account was its only reactor.
// The rooms it owned went first, so the memberships left are the rooms it is still in
export const deleteAccountMemberRoomReactions = async (userId: UserInAuth["id"]): Promise<void> => {
  const memberRoomIds = await getAccountMemberRoomIds(userId);
  for (const roomId of memberRoomIds)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one room at a time, as the moderation ban walks them
    await getRoomObject(roomId).deleteUserReactions(userId);
};
