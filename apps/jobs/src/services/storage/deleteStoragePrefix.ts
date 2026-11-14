import type { StorageBucket } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { getBucket } from "#src/services/storage/getBucket";
import { deleteStorageBlobs, listBlobNames } from "@esposter/db";

// Deletes every blob under a prefix the way a prefix blob-deletion event does: each blob's ledger row gives its bytes back
// To whoever was charged for it, and every owner it gave bytes back to is told. A room's attachments are charged to the
// Members who uploaded them, so the release cannot be skipped the way a bare directory teardown skips it
export const deleteStoragePrefix = async (containerName: StorageBucket, prefix: string): Promise<void> => {
  const bucket = getBucket(containerName);
  const blobNames = await listBlobNames(bucket, prefix);
  await deleteStorageBlobs(db, bucket, containerName, blobNames, (releasedUserIds) =>
    broadcastStorageUsage(releasedUserIds),
  );
};
