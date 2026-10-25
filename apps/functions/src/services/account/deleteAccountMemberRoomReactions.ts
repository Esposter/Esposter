import type { UserInAuth } from "@esposter/db-schema";

import { deleteAccountRoomReactions } from "#src/services/account/deleteAccountRoomReactions";
import { getTableClient } from "#src/services/azure/getTableClient";
import { db } from "#src/services/shared/db";
import { AzureTable, usersToRoomsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The reactions the account is on in each room it is a member of. The rooms it owned went first, with their partitions,
// so the memberships left are the rooms it is still in
export const deleteAccountMemberRoomReactions = async (userId: UserInAuth["id"]): Promise<void> => {
  const memberRooms = await db
    .select({ roomId: usersToRoomsInMessage.roomId })
    .from(usersToRoomsInMessage)
    .where(eq(usersToRoomsInMessage.userId, userId));
  const messagesMetadataClient = await getTableClient(AzureTable.MessagesMetadata);
  for (const { roomId } of memberRooms)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one room at a time, as the soft delete walks them
    await deleteAccountRoomReactions(messagesMetadataClient, roomId, userId);
};
