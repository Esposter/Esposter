import type { TimerHandler } from "@azure/functions";
import type { StorageBlob } from "@esposter/db-schema";

import { db } from "@/services/db";
import { getContainerClient } from "@/services/getContainerClient";
import { logAndRethrow } from "@/services/logAndRethrow";
import { reconcileStorageBlob, releaseStorageBlobs } from "@esposter/db";
import {
  AzureFunction,
  MAX_CONCURRENT_STORAGE_BLOB_PROBES,
  MAX_SETTLE_STORAGE_BLOBS,
  storageBlobs,
} from "@esposter/db-schema";
import { chunk, getResultAsync, noop } from "@esposter/shared";
import { and, asc, isNull, lt } from "drizzle-orm";

// What turns a client's declaration into the truth. Past `expiresAt` the write SAS is dead, so whatever is in
// Blob storage is final: the blob's real size replaces the declaration, or there is no blob and the hold is
// Given back. Doing it here rather than off a BlobCreated event is what makes it uniform — a resource asset
// Has no persistence record to confirm against, and an upload abandoned mid-flight emits no event at all.
//
// Existence is asked as `exists()` rather than inferred from a getProperties rejection: a 404 and a transient
// Failure arrive the same way, and releasing on the second would hand back bytes that are still stored. A row
// Whose probe fails simply keeps its unreconciled state and is re-driven on the next tick.
export const settleStorageBlobsHandler: TimerHandler = (_timer, context) =>
  getResultAsync(async () => {
    const expiredStorageBlobs = await db
      .select()
      .from(storageBlobs)
      .where(and(isNull(storageBlobs.reconciledAt), lt(storageBlobs.expiresAt, new Date())))
      // Oldest first, so a backlog larger than one batch drains in order instead of starving its tail
      .orderBy(asc(storageBlobs.expiresAt))
      .limit(MAX_SETTLE_STORAGE_BLOBS);
    if (expiredStorageBlobs.length === 0) return;

    context.log(`${AzureFunction.SettleStorageBlobs} settling`, { count: expiredStorageBlobs.length });
    if (expiredStorageBlobs.length === MAX_SETTLE_STORAGE_BLOBS)
      context.log(
        `${AzureFunction.SettleStorageBlobs} hit the ${MAX_SETTLE_STORAGE_BLOBS} row batch cap — the remainder settles on the next tick.`,
      );

    for (const expiredStorageBlobsChunk of chunk(expiredStorageBlobs, MAX_CONCURRENT_STORAGE_BLOB_PROBES))
      await Promise.all(expiredStorageBlobsChunk.map((storageBlob) => settleStorageBlob(storageBlob, context)));
  }).match(noop, logAndRethrow(context, AzureFunction.SettleStorageBlobs));

const settleStorageBlob = async (storageBlob: StorageBlob, context: Parameters<TimerHandler>[1]): Promise<void> => {
  const { blobName, containerName } = storageBlob;
  await getResultAsync(async () => {
    const containerClient = await getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    if (!(await blockBlobClient.exists())) {
      await releaseStorageBlobs(db, containerName, [blobName]);
      return;
    }

    // A blob with no reported length is one Azure is still assembling; leaving the row unreconciled
    // Re-drives it next tick rather than writing a zero the counter would then be stuck with
    const { contentLength } = await blockBlobClient.getProperties();
    if (contentLength === undefined) return;

    await reconcileStorageBlob(db, containerName, blobName, contentLength);
  }).match(noop, (error) => {
    // Per row, so one unreachable blob cannot stop the rest of the sweep; its row survives unreconciled,
    // So the next tick retries it. Never rethrown — a rethrow would re-drive rows this pass already settled
    context.error(`${AzureFunction.SettleStorageBlobs} failed to settle ${containerName}/${blobName}: `, error);
  });
};
