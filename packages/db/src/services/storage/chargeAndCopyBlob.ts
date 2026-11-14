import type { R2Bucket } from "@cloudflare/workers-types";
import type { Database, StorageBucket, UserInAuth } from "@esposter/db-schema";

import { chargeStorageLedgerEntry } from "#src/services/storage/chargeStorageLedgerEntry";
import { copyBlob } from "#src/services/storage/copyBlob";
import { releaseStorageLedgerEntries } from "#src/services/storage/releaseStorageLedgerEntries";
import { getResultAsync, noop } from "@esposter/shared";

// A copy the server makes of a blob it already holds, charged to whoever receives it. The charge is taken before the
// Bytes are written: the write's own notification orders nothing, and an event arriving before its row exists is dropped
// For good. The length is provisional, and the copy's own write notification replaces it with the stored size. A copy
// That fails gives the charge back before its failure is rethrown, so a failed copy leaves nothing counted
export const chargeAndCopyBlob = async (
  db: Database,
  userId: UserInAuth["id"],
  bucketName: StorageBucket,
  bucket: R2Bucket,
  sourceBlobName: string,
  destinationBlobName: string,
  contentLength: number,
): Promise<void> => {
  await chargeStorageLedgerEntry(db, userId, bucketName, destinationBlobName, contentLength);
  await getResultAsync(() => copyBlob(bucket, sourceBlobName, destinationBlobName)).match(noop, async (error) => {
    await releaseStorageLedgerEntries(db, bucketName, [destinationBlobName]);
    throw error;
  });
};
