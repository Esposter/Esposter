/* oxlint-disable no-await-in-loop -- Bounded concurrency: one room at a time, one page of its reactions at a time */
import type { RoomReaction, UserInAuth } from "@esposter/db-schema";

import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { getRoomObject } from "#src/services/room/getRoomObject";
import { OBJECT_READ_PAGE_LIMIT } from "#src/services/shared/constants";
import { readPagesToEnd } from "#src/services/shared/readPagesToEnd";
import { noop } from "@esposter/shared";

// The reactions the account is on in each room it is a member of.
// Each room takes the account off the emoji's reactors, and the reaction goes when the account was its only reactor.
// The rooms it owned went first, so the memberships left are the rooms it is still in
export const deleteAccountMemberRoomReactions = async (userId: UserInAuth["id"]): Promise<void> => {
  const memberRoomIds = await getAccountMemberRoomIds(userId);
  for (const roomId of memberRoomIds) {
    const roomObject = getRoomObject(roomId);
    // The read that answers each page takes the account off its reactions, so a page has nothing left to do
    await readPagesToEnd(
      (after, limit) => roomObject.deleteUserReactions({ after, limit, userId }),
      ({ emojiTag, messageId }: RoomReaction) => ({ emojiTag, messageId }),
      OBJECT_READ_PAGE_LIMIT,
      noop,
    );
  }
};
