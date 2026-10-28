import type { UserInAuth } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import {
  DATA_EXPORT_CONTENT_TYPE,
  DATA_EXPORT_UPLOAD_BUFFER_SIZE,
  DATA_EXPORT_UPLOAD_MAX_CONCURRENCY,
} from "#src/services/user/constants";
import { createUserDataArchive } from "#src/services/user/createUserDataArchive";
import { writeAccountEntry } from "#src/services/user/writeAccountEntry";
import { writeCallSessionEntry } from "#src/services/user/writeCallSessionEntry";
import { writeFriendEntries } from "#src/services/user/writeFriendEntries";
import { writeImageEntries } from "#src/services/user/writeImageEntries";
import { writeLikeEntries } from "#src/services/user/writeLikeEntries";
import { writeMembershipEntry } from "#src/services/user/writeMembershipEntry";
import { writeModerationActionEntry } from "#src/services/user/writeModerationActionEntry";
import { writeModerationEntry } from "#src/services/user/writeModerationEntry";
import { writeOwnedRoomEntries } from "#src/services/user/writeOwnedRoomEntries";
import { writePostEntries } from "#src/services/user/writePostEntries";
import { writeResourceAccessEntry } from "#src/services/user/writeResourceAccessEntry";
import { writeResourceEntries } from "#src/services/user/writeResourceEntries";
import { writeResourceFavoriteEntry } from "#src/services/user/writeResourceFavoriteEntry";
import { writeRoomEntries } from "#src/services/user/writeRoomEntries";
import { writeSaveEntries } from "#src/services/user/writeSaveEntries";
import { writeSearchHistoryEntry } from "#src/services/user/writeSearchHistoryEntry";
import { writeThreadFollowEntry } from "#src/services/user/writeThreadFollowEntry";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Streams one person's archive into the block blob named for it. The groups write the archive while the upload reads it,
// So the build holds a block of it at a time, whatever the account holds. A failed write destroys the stream unfinished,
// So the upload never commits a truncated archive, and the write's own error is the one reported. A failed upload is
// Rethrown as it is; the writes then wait on a stream nothing drains, which holds nothing more
export const buildUserDataArchive = async (userId: UserInAuth["id"], blobName: string): Promise<void> => {
  const containerClient = await getContainerClient(AzureContainer.UserAssets);
  const archive = createUserDataArchive();
  const failArchive = (error: Error): never => {
    archive.output.destroy();
    throw error;
  };
  const uploading = getResultAsync(() =>
    containerClient
      .getBlockBlobClient(blobName)
      .uploadStream(archive.output, DATA_EXPORT_UPLOAD_BUFFER_SIZE, DATA_EXPORT_UPLOAD_MAX_CONCURRENCY, {
        blobHTTPHeaders: { blobContentType: DATA_EXPORT_CONTENT_TYPE },
      }),
  ).match(noop, (error) => {
    throw error;
  });
  const writing = getResultAsync(async () => {
    await writeAccountEntry(archive, userId);
    await writeFriendEntries(archive, userId);
    await writePostEntries(archive, userId);
    await writeLikeEntries(archive, userId);
    await writeRoomEntries(archive, userId);
    await writeCallSessionEntry(archive, userId);
    await writeThreadFollowEntry(archive, userId);
    await writeMembershipEntry(archive, userId);
    await writeOwnedRoomEntries(archive, userId);
    await writeResourceEntries(archive, userId);
    await writeResourceFavoriteEntry(archive, userId);
    await writeResourceAccessEntry(archive, userId);
    await writeSaveEntries(archive, userId);
    await writeSearchHistoryEntry(archive, userId);
    await writeImageEntries(archive, userId);
    await writeModerationEntry(archive, userId);
    await writeModerationActionEntry(archive, userId);
    archive.end();
  }).match(noop, failArchive);
  await Promise.all([uploading, writing]);
};
