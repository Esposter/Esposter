import type { ContainerClient } from "@azure/storage-blob";
import type { AzureContainer, Database } from "@esposter/db-schema";

import { releaseStorageBlobs } from "@/services/storage/releaseStorageBlobs";
import { MAX_CONCURRENT_BLOB_DELETIONS } from "@esposter/db-schema";
import { chunk, getResultAsync, takeOne } from "@esposter/shared";

// Removing a blob and giving its bytes back are one operation, so they live in one function: the ledger row is
// The only record of who was charged for a blob, and a blob deleted with its row left standing is bytes held
// Against a user for a file that no longer exists — visible to them as a storage bar that never comes down.
//
// A prefix set has no ceiling, so the work goes out in bounded waves: one request per blob all at once
// Exhausts sockets and throttles the account, and one unchunked `IN (…)` release past a few tens of thousands
// Of names exceeds what a single postgres bind message may carry. Each wave releases exactly the names it
// Removed — not the set it was asked for — so a wave that throws leaves nothing stranded behind it: the names
// It did remove are already out of the ledger, and the redelivered event re-resolves a smaller set.
export const deleteStorageBlobs = async (
  db: Database,
  containerClient: ContainerClient,
  containerName: AzureContainer,
  blobNames: string[],
): Promise<void> => {
  for (const blobNamesChunk of chunk(blobNames, MAX_CONCURRENT_BLOB_DELETIONS)) {
    const deletedBlobNames: string[] = [];
    const errors: Error[] = [];
    // Deleting only if the blob exists: a redelivery or a dead-letter replay re-runs the whole batch, and the
    // Blobs an earlier attempt already removed must not fail the ones it did not reach
    await Promise.all(
      blobNamesChunk.map((blobName) =>
        getResultAsync(() => containerClient.getBlockBlobClient(blobName).deleteIfExists()).match(
          () => {
            deletedBlobNames.push(blobName);
          },
          (error) => {
            errors.push(error);
          },
        ),
      ),
    );
    // After the blobs are gone, so a release can never hand bytes back for a blob still stored
    await releaseStorageBlobs(db, containerName, deletedBlobNames);
    // Rethrown once the release has landed, never before it: the failure is what makes Event Grid redeliver,
    // And the blobs this wave did remove must not wait for that redelivery to be given back
    if (errors.length > 0) throw takeOne(errors);
  }
};
