/* oxlint-disable no-await-in-loop -- Bounded concurrency: one room at a time, and one scheduled message at a time within it */
import type { UserInAuth } from "@esposter/db-schema";

import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { getRoomObject } from "#src/services/room/getRoomObject";
import { db } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { getBucket } from "#src/services/storage/getBucket";
import { deleteStorageBlobs, getFilesBlobNames } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";

// The account's messages are erased in every room it is a member of, and so are the messages it has scheduled there. An
// erased message loses its text, files and link preview, and its row stays as a tombstone, so a reply still names a root.
// The blobs its files named go through the release a blob deletion runs. The rooms it owned were deleted by the step before,
// along with their memberships, so the memberships left are the rooms it is still in
export const eraseAccountMessages = async (userId: UserInAuth["id"]): Promise<void> => {
  const memberRoomIds = await getAccountMemberRoomIds(userId);
  const bucket = getBucket(StorageBucket.MessageAssets);
  for (const roomId of memberRoomIds) {
    const roomObject = getRoomObject(roomId);
    const erasedMessages = await roomObject.deleteUserMessages(userId);
    const blobNames = getFilesBlobNames(
      roomId,
      erasedMessages.flatMap(({ files }) => files),
    );
    await deleteStorageBlobs(db, bucket, StorageBucket.MessageAssets, blobNames, (releasedUserIds) =>
      broadcastStorageUsage(releasedUserIds),
    );
    const scheduledMessages = await roomObject.readScheduledMessages(userId);
    for (const { id } of scheduledMessages) await roomObject.deleteScheduledMessage(id, { userId });
  }
};
