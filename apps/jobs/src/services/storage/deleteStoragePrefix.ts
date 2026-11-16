import type { StorageBucket } from "@esposter/db-schema";

import { deleteStorageBlobsAndBroadcast } from "#src/services/storage/deleteStorageBlobsAndBroadcast";
import { getBucket } from "#src/services/storage/getBucket";
import { listBlobNames } from "@esposter/db";

// Deletes every blob under a prefix in this call, releasing each blob's ledger row the way the process-blob-deletion
// Handler does for a prefix message: each row gives its bytes back to whoever was charged for it, and every owner it
// Gave bytes back to is told. A room's attachments are charged to the members who uploaded them, so the release cannot
// Be skipped the way a bare directory teardown skips it
export const deleteStoragePrefix = async (storageBucket: StorageBucket, prefix: string): Promise<void> => {
  const bucket = getBucket(storageBucket);
  const blobNames = await listBlobNames(bucket, prefix);
  await deleteStorageBlobsAndBroadcast(bucket, storageBucket, blobNames);
};
