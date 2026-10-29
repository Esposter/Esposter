import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { getTableClient } from "#src/services/azure/getTableClient";
import { readRoomMessagesByUser } from "#src/services/user/readRoomMessagesByUser";
import { writeRoomFileEntries } from "#src/services/user/writeRoomFileEntries";
import { AzureTable } from "@esposter/db-schema";

// The rooms the person is a member of are written one at a time.
// Each is written as its messages.json and the attachments those messages name.
// Membership is the only index from a person to a room, so a room they have left is not in the archive
export const writeRoomEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const messageClient = await getTableClient(AzureTable.Messages);
  const roomIds = await getAccountMemberRoomIds(userId);
  for (const roomId of roomIds) {
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one room at a time, so one attachment is held at once
    const messages = await readRoomMessagesByUser(messageClient, roomId, userId);
    // oxlint-disable-next-line no-await-in-loop -- The archive takes one entry at a time, so its entries stay in order
    await archive.addJsonEntry(`rooms/${roomId}/messages.json`, messages);
    // oxlint-disable-next-line no-await-in-loop -- The archive takes one entry at a time, so its entries stay in order
    await writeRoomFileEntries(archive, roomId, messages);
  }
};
