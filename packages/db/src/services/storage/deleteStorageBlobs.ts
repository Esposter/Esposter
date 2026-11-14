/* oxlint-disable no-await-in-loop -- Bounded concurrency: MAX_CONCURRENT_BLOB_DELETIONS at a time, a chunk per wave */
import type { R2Bucket } from "@cloudflare/workers-types";
import type { Database, StorageBucket, UserInAuth } from "@esposter/db-schema";

import { deleteBlobs } from "#src/services/storage/deleteBlobs";
import { releaseStorageLedgerEntries } from "#src/services/storage/releaseStorageLedgerEntries";
import { MAX_CONCURRENT_BLOB_DELETIONS } from "@esposter/db-schema";
import { chunk, getResultAsync, rethrowRejections } from "@esposter/shared";

// Removing a blob and giving its bytes back are one operation, so they live in one function: the ledger row is
// The only record of who was charged for a blob, and a blob deleted with its row left standing is bytes held
// Against a user for a file that no longer exists — visible to them as a storage bar that never comes down.
//
// A prefix set has no ceiling, so the work goes out in bounded waves: one unchunked release past a few tens of
// Thousands of names would bind one JSON array too large for a single D1 bound string. Each wave releases exactly the
// Names it removed, not the set it was asked for, so a wave that throws leaves nothing stranded behind it: the names
// It did remove are already out of the ledger, and the redelivered event re-resolves a smaller set. `onReleased` is
// Handed each wave's owners as the wave lands, for the same reason the release itself does not wait: a wave that gives
// Bytes back and then throws would otherwise announce nothing, and the redelivery that follows re-resolves a smaller
// Set, one that can be empty, leaving the meter stale with nothing left to fix it. Deduped across waves, so a
// Directory-sized deletion costs its owner one re-read rather than one per wave.
export const deleteStorageBlobs = async (
  db: Database,
  bucket: R2Bucket,
  bucketName: StorageBucket,
  blobNames: string[],
  onReleased: (userIds: UserInAuth["id"][]) => Promise<void>,
): Promise<void> => {
  const releasedUserIds = new Set<UserInAuth["id"]>();
  for (const blobNamesChunk of chunk(blobNames, MAX_CONCURRENT_BLOB_DELETIONS)) {
    const errors: Error[] = [];
    // A wave that fails removed nothing it can vouch for, so only a wave that landed is released
    const deletedBlobNames = await getResultAsync(() => deleteBlobs(bucket, blobNamesChunk)).match(
      () => blobNamesChunk,
      (error) => {
        errors.push(error);
        return [];
      },
    );
    // After the blobs are gone, so a release can never hand bytes back for a blob still stored
    const newlyReleasedUserIds = (await releaseStorageLedgerEntries(db, bucketName, deletedBlobNames)).filter(
      (userId) => !releasedUserIds.has(userId),
    );
    for (const newlyReleasedUserId of newlyReleasedUserIds) releasedUserIds.add(newlyReleasedUserId);
    if (newlyReleasedUserIds.length > 0) await onReleased(newlyReleasedUserIds);
    // Rethrown once the release has landed, never before it: the failure is what makes the queue redeliver, and the
    // Blobs this wave did remove must not wait for that redelivery to be given back
    rethrowRejections(errors);
  }
};
