import type { UserInAuth } from "@esposter/db-schema";

import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { getTableClient } from "#src/services/azure/getTableClient";
import { softDeleteRoomMessagesByUser } from "@esposter/db";
import { AzureTable } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

// The account's messages are soft-deleted in every room it is a member of, through the same soft delete a moderation ban
// Runs. The rooms it owned were deleted by the step before, along with their memberships, so the memberships left are
// The rooms it is still in
export const softDeleteAccountMessages = async (userId: UserInAuth["id"]): Promise<void> => {
  const memberRoomIds = await getAccountMemberRoomIds(userId);
  const messageClient = await getTableClient(AzureTable.Messages);
  for (const roomId of memberRoomIds)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one room at a time, as the moderation ban runs
    await softDeleteRoomMessagesByUser(messageClient, roomId, userId, noop);
};
