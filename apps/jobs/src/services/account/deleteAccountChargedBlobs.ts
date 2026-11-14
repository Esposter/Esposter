import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { getBucket } from "#src/services/storage/getBucket";
import { deleteStorageBlobs, listChargedBlobsByUser } from "@esposter/db";

// The blobs the account is charged for come from the storage ledger, so the sweep removes exactly what was charged and
// Never lists a directory to find them. Each container's blobs go through the release a blob deletion runs, so their
// Ledger rows go with them
export const deleteAccountChargedBlobs = async (userId: UserInAuth["id"]): Promise<void> => {
  const containerBlobNamesMap = await listChargedBlobsByUser(db, userId);
  for (const [containerName, blobNames] of containerBlobNamesMap) {
    const bucket = getBucket(containerName);
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one container at a time, its blobs in waves
    await deleteStorageBlobs(db, bucket, containerName, blobNames, (releasedUserIds) =>
      broadcastStorageUsage(releasedUserIds),
    );
  }
};
