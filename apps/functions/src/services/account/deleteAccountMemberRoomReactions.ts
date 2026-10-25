import type { UserInAuth } from "@esposter/db-schema";

import { deleteAccountRoomReactions } from "#src/services/account/deleteAccountRoomReactions";
import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { getTableClient } from "#src/services/azure/getTableClient";
import { AzureTable } from "@esposter/db-schema";

// The reactions the account is on in each room it is a member of. The rooms it owned went first, with their partitions,
// So the memberships left are the rooms it is still in
export const deleteAccountMemberRoomReactions = async (userId: UserInAuth["id"]): Promise<void> => {
  const memberRoomIds = await getAccountMemberRoomIds(userId);
  const messagesMetadataClient = await getTableClient(AzureTable.MessagesMetadata);
  for (const roomId of memberRoomIds)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one room at a time, as the soft delete walks them
    await deleteAccountRoomReactions(messagesMetadataClient, roomId, userId);
};
