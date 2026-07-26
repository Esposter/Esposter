import type { EventGridHandler } from "@azure/functions";

import { getContainerClient } from "@/services/getContainerClient";
import { logAndRethrow } from "@/services/logAndRethrow";
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
    const { blobNames, containerName } = blobDeletionEventGridDataSchema.parse(event.data);
    const containerClient = await getContainerClient(containerName);
    // Deleting only if the blob exists: a redelivery or a dead-letter replay re-runs the whole batch, and the blobs
    // An earlier attempt already removed must not fail the ones it did not reach.
    await Promise.all(blobNames.map((blobName) => containerClient.getBlockBlobClient(blobName).deleteIfExists()));
    context.log(`${AzureFunction.ProcessBlobDeletion} deleted ${blobNames.length} blobs from ${containerName}.`);
  }).match(noop, logAndRethrow(context, AzureFunction.ProcessBlobDeletion));
};
