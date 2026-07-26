import type { ContainerClient } from "@azure/storage-blob";

import { listBlobNames } from "@/services/azure/container/listBlobNames";
import { MAX_BLOB_BATCH_DELETIONS } from "@esposter/db-schema";

export const deleteDirectory = async (containerClient: ContainerClient, prefix = "", isDeep?: true) => {
  // Built through the sdk client rather than interpolated: a blob name is arbitrary user text, and `#` or `?`
  // In an interpolated url terminates the path at the parser, so the batch would target a truncated name that
  // Does not exist. `deleteBlobs` reports that as a failed sub-response instead of throwing, so the caller sees
  // A successful teardown while the real blob survives — billed forever and outside every later sweep.
  const blobUrls = (await listBlobNames(containerClient, prefix, { isDeep })).map(
    (name) => containerClient.getBlockBlobClient(name).url,
  );
  if (blobUrls.length === 0) return;

  // A directory's blob count has no ceiling, and a batch past MAX_BLOB_BATCH_DELETIONS throws before issuing a
  // Single delete — the whole teardown then fails rather than deleting most of it, so the batches go out in waves
  const blobBatchClient = containerClient.getBlobBatchClient();
  for (let index = 0; index < blobUrls.length; index += MAX_BLOB_BATCH_DELETIONS)
    await blobBatchClient.deleteBlobs(
      blobUrls.slice(index, index + MAX_BLOB_BATCH_DELETIONS),
      containerClient.credential,
    );
};
