import type { EventGridHandler } from "@azure/functions";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { db } from "#src/services/shared/db";
import { logAndRethrow } from "#src/services/shared/logAndRethrow";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { dropBlobNamesWrittenAfter } from "#src/services/storage/dropBlobNamesWrittenAfter";
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
    // A named deletion decided at `decidedAt` drops any blob written since, so a replay never deletes a re-uploaded one
    const blobNames =
      "blobNames" in data
        ? await dropBlobNamesWrittenAfter(containerClient, data.blobNames, data.decidedAt)
        : await listBlobNames(containerClient, data.prefix, { createdBefore: data.createdBefore });
    if ("blobNames" in data && data.decidedAt)
      context.log(
        `${AzureFunction.ProcessBlobDeletion} kept ${data.blobNames.length - blobNames.length} blobs written after their deletion was decided.`,
      );
    // The delete and the release of the bytes it frees are one operation, waved and retried together — see
    // `deleteStorageBlobs` and openspec/specs/resource/storage-quotas/design.md
    await deleteStorageBlobs(db, containerClient, data.containerName, blobNames, (releasedUserIds) =>
      broadcastStorageUsage(context, releasedUserIds),
    );
    context.log(`${AzureFunction.ProcessBlobDeletion} deleted ${blobNames.length} blobs from ${data.containerName}.`);
  }).match(noop, logAndRethrow(context, AzureFunction.ProcessBlobDeletion));
};
