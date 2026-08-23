import type { ContainerClient } from "@azure/storage-blob";

import { listBlobNames } from "#src/services/azure/container/listBlobNames";
import { MAX_BLOB_BATCH_DELETIONS } from "@esposter/db-schema";
import { chunk, InvalidOperationError, normalizeString, Operation } from "@esposter/shared";

export const deleteDirectory = async (containerClient: ContainerClient, prefix = "") => {
  // Built through the sdk client rather than interpolated: a blob name is arbitrary user text, and `#` or `?`
  // In an interpolated url terminates the path at the parser, so the batch would target a truncated name that
  // Does not exist. `deleteBlobs` reports that as a failed sub-response instead of throwing, so the caller sees
  // A successful teardown while the real blob survives — billed forever and outside every later sweep.
  const blobUrls = (await listBlobNames(containerClient, prefix)).map(
    (name) => containerClient.getBlockBlobClient(name).url,
  );
  if (blobUrls.length === 0) return;
  // A directory's blob count has no ceiling, and a batch past MAX_BLOB_BATCH_DELETIONS throws before issuing a
  // Single delete — the whole teardown then fails rather than deleting most of it, so the batches go out in waves
  const blobBatchClient = containerClient.getBlobBatchClient();
  for (const blobUrlBatch of chunk(blobUrls, MAX_BLOB_BATCH_DELETIONS)) {
    const { subResponses } = await blobBatchClient.deleteBlobs(blobUrlBatch, containerClient.credential);
    // The batch itself resolves 202 whatever its blobs did — every per-blob outcome is reported in the
    // Sub-responses instead. Unread, they are the same silent hole an unescaped name opens above: the caller
    // Sees a successful teardown while the blob survives, billed forever and outside every later sweep.
    // 404 is the one status that is success here: every caller is a teardown that must converge when it re-runs
    // (purgeResource is retried by a timer, and the duplicate rollback re-deletes what it managed to clone), so
    // A blob an earlier attempt already removed is the state being asked for, not a failure
    const failedSubResponse = subResponses.find(({ status }) => status >= 300 && status !== 404);
    if (failedSubResponse)
      throw new InvalidOperationError(
        Operation.Delete,
        deleteDirectory.name,
        normalizeString(
          `${failedSubResponse.status} ${failedSubResponse.errorCode ?? failedSubResponse.statusMessage ?? ""}`,
        ),
      );
  }
};
