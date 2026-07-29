import type { EventGridHandler } from "@azure/functions";

import { getContainerClient } from "@/services/getContainerClient";
import { logAndRethrow } from "@/services/logAndRethrow";
import { listBlobNames } from "@esposter/db";
import { AzureFunction, blobDeletionEventGridDataSchema, MAX_CONCURRENT_BLOB_DELETIONS } from "@esposter/db-schema";
import { chunk, getResultAsync, noop } from "@esposter/shared";
// A read SAS url outlives the delete request that should have invalidated it, so a blob whose delete was dropped stays
// Downloadable to anyone still holding one. That makes the delete an effect whose loss is unacceptable: it is published
// As an event and retried here until it lands, rather than logged away at the call site.
export const processBlobDeletionHandler: EventGridHandler = (event, context) => {
  // Log the subject, not the payload: a deletion event can carry hundreds of blob names, so the full array would be
  // Written out verbatim on every delivery.
  context.log(`${AzureFunction.ProcessBlobDeletion} processed subject: `, event.subject);
  return getResultAsync(async () => {
    const data = blobDeletionEventGridDataSchema.parse(event.data);
    const containerClient = await getContainerClient(data.containerName);
    // A prefix event carries an unbounded set the publisher could not afford to enumerate on its request path,
    // So the walk happens here — where a retry costs nothing and the time budget is the worker's, not a user's.
    // Bounded by the publisher's own instant, so a redelivery deletes the set that existed when the deletion was
    // Decided rather than whatever the prefix holds now — a resource republished in between keeps its new blobs
    const blobNames =
      "blobNames" in data
        ? data.blobNames
        : await listBlobNames(containerClient, data.prefix, { createdBefore: data.createdBefore });
    // Deleting only if the blob exists: a redelivery or a dead-letter replay re-runs the whole batch, and the blobs
    // An earlier attempt already removed must not fail the ones it did not reach. A prefix set has no ceiling, so
    // The deletes go out in bounded waves — one request per blob all at once exhausts sockets and throttles
    for (const blobNamesChunk of chunk(blobNames, MAX_CONCURRENT_BLOB_DELETIONS))
      await Promise.all(
        blobNamesChunk.map((blobName) => containerClient.getBlockBlobClient(blobName).deleteIfExists()),
      );
    context.log(`${AzureFunction.ProcessBlobDeletion} deleted ${blobNames.length} blobs from ${data.containerName}.`);
  }).match(noop, logAndRethrow(context, AzureFunction.ProcessBlobDeletion));
};
