import type { UserInAuth } from "@esposter/db-schema";

import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { getStreamTableClient } from "#src/services/streams/getStreamTableClient";
import { eraseRoomMessagesByUser } from "@esposter/db";
import { StreamTable } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

// The account's messages are erased in every room it is a member of, through the erase a moderation ban does not run:
// A ban hides a message and keeps its text. The rooms it owned were deleted by the step before, along with their
// Memberships, so the memberships left are the rooms it is still in
export const eraseAccountMessages = async (userId: UserInAuth["id"]): Promise<void> => {
  const memberRoomIds = await getAccountMemberRoomIds(userId);
  const messageClient = getStreamTableClient(StreamTable.Messages);
  for (const roomId of memberRoomIds)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one room at a time, as the moderation ban runs
    await eraseRoomMessagesByUser(messageClient, roomId, userId, noop);
};
