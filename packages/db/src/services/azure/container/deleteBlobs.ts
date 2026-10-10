import type { BlobRequestConditions, ContainerClient } from "@azure/storage-blob";

import { MAX_BLOB_BATCH_DELETIONS } from "@esposter/db-schema";
import { chunk, InvalidOperationError, normalizeString, Operation, takeOne } from "@esposter/shared";

// Deletes the named blobs in batches, returning the names a condition kept. A blob url is built through the sdk
// Client rather than interpolated: a blob name is arbitrary user text, and `#` or `?` in an interpolated url ends the
// Path at the parser, so the batch would target a truncated name that does not exist. `deleteBlobs` reports that as a
// Failed sub-response instead of throwing, so the caller would see a successful teardown while the real blob survives
// — billed forever and outside every later sweep.
export const deleteBlobs = async (
  containerClient: ContainerClient,
  blobNames: string[],
  conditions?: BlobRequestConditions,
): Promise<string[]> => {
  const blobBatchClient = containerClient.getBlobBatchClient();
  const keptBlobNames: string[] = [];
  // A directory's blob count has no ceiling, and a batch past MAX_BLOB_BATCH_DELETIONS throws before issuing a
  // Single delete — the whole teardown then fails rather than deleting most of it, so the batches go out in waves
  for (const blobNameBatch of chunk(blobNames, MAX_BLOB_BATCH_DELETIONS)) {
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: the batches go out in waves, as above
    const { subResponses } = await blobBatchClient.deleteBlobs(
      blobNameBatch.map((blobName) => containerClient.getBlockBlobClient(blobName).url),
      containerClient.credential,
      { conditions },
    );
    // The batch itself resolves 202 whatever its blobs did — every per-blob outcome is reported in the sub-responses,
    // Which are read here rather than left as the same silent hole an unescaped name opens. 404 is success: every
    // Caller is a teardown that must converge when it re-runs, so a blob an earlier attempt already removed is the
    // State being asked for. 412 is only ever the condition refusing a blob that changed since the caller listed it,
    // So it is reported as kept for a conditional delete and is a failure for any other
    for (const [index, { errorCode, status, statusMessage }] of subResponses.entries()) {
      if (status === 404) continue;
      if (status === 412 && conditions) {
        keptBlobNames.push(takeOne(blobNameBatch, index));
        continue;
      }
      if (status >= 300)
        throw new InvalidOperationError(
          Operation.Delete,
          deleteBlobs.name,
          normalizeString(`${status} ${errorCode ?? statusMessage ?? ""}`),
        );
    }
  }
  return keptBlobNames;
};
