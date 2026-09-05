import type { EventGridHandler } from "@azure/functions";

import { broadcastStorageUsage } from "#src/services/broadcastStorageUsage";
import { db } from "#src/services/db";
import { getContainerClient } from "#src/services/getContainerClient";
import { logAndRethrow } from "#src/services/logAndRethrow";
import { deleteStorageBlobs, listBlobNames } from "@esposter/db";
import { AzureFunction, blobDeletionEventGridDataSchema } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
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
    // The delete and the release of the bytes it frees are one operation, waved and retried together — see
    // `deleteStorageBlobs` and /docs/platform/storage-quotas
    await deleteStorageBlobs(db, containerClient, data.containerName, blobNames, (releasedUserIds) =>
      broadcastStorageUsage(context, releasedUserIds),
    );
    context.log(`${AzureFunction.ProcessBlobDeletion} deleted ${blobNames.length} blobs from ${data.containerName}.`);
  }).match(noop, logAndRethrow(context, AzureFunction.ProcessBlobDeletion));
};
