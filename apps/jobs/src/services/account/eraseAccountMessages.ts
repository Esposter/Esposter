/* oxlint-disable no-await-in-loop -- Bounded concurrency: one room at a time, one page of its messages at a time, and one scheduled message at a time */
import type { PageCursor, RoomMessage, ScheduledMessageInUser, UserInAuth } from "@esposter/db-schema";

import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { takeBackErasedMentionCounts } from "#src/services/account/takeBackErasedMentionCounts";
import { getRoomObject } from "#src/services/room/getRoomObject";
import { OBJECT_READ_PAGE_LIMIT } from "#src/services/shared/constants";
import { db } from "#src/services/shared/db";
import { readPagesToEnd } from "#src/services/shared/readPagesToEnd";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { getBucket } from "#src/services/storage/getBucket";
import { getUserObject } from "#src/services/user/getUserObject";
import { deleteStorageBlobs, getFilesBlobNames, toPageCursorValue } from "@esposter/db";
import { SCHEDULED_MESSAGE_JOB_PAGE_SORT, START_PAGE_CURSOR, StorageBucket } from "@esposter/db-schema";

// The account's messages are erased in every room it is a member of, a page at a time. An erased message loses its text,
// Files and link preview, and its row stays as a tombstone, so a reply still names a root. The blobs its files named go
// Through the release a blob deletion runs, page by page.
// The scheduled messages are named by the account's own index, so each is reached in the room it was set in, member or not.
// The index is cleared after this, so this step runs before the user object is erased
export const eraseAccountMessages = async (userId: UserInAuth["id"]): Promise<void> => {
  const memberRoomIds = await getAccountMemberRoomIds(userId);
  const bucket = getBucket(StorageBucket.MessageAssets);
  for (const roomId of memberRoomIds) {
    const roomObject = getRoomObject(roomId);
    await readPagesToEnd(
      (after, limit) => roomObject.deleteUserMessages({ after, limit, userId }),
      ({ id }: RoomMessage) => id,
      OBJECT_READ_PAGE_LIMIT,
      async (erasedMessages) => {
        const blobNames = getFilesBlobNames(
          roomId,
          erasedMessages.flatMap(({ files }) => files),
        );
        await deleteStorageBlobs(db, bucket, StorageBucket.MessageAssets, blobNames, (releasedUserIds) =>
          broadcastStorageUsage(releasedUserIds),
        );
        await takeBackErasedMentionCounts(roomId, userId, erasedMessages);
      },
    );
  }

  await readPagesToEnd(
    (cursor, limit) => getUserObject(userId).readScheduledMessages({ cursor: cursor ?? START_PAGE_CURSOR, limit }),
    (scheduledMessage: ScheduledMessageInUser): PageCursor => ({
      isBackward: false,
      values: SCHEDULED_MESSAGE_JOB_PAGE_SORT.keys.map((key) => toPageCursorValue(scheduledMessage[key])),
    }),
    OBJECT_READ_PAGE_LIMIT,
    async (scheduledMessages) => {
      for (const { id, roomId } of scheduledMessages)
        await getRoomObject(roomId).deleteScheduledMessage(id, { userId });
    },
  );
};
