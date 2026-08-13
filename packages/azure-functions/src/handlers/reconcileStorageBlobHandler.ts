import type { EventGridHandler } from "@azure/functions";

import { db } from "@/services/db";
import { logAndRethrow } from "@/services/logAndRethrow";
import { reconcileStorageBlob } from "@esposter/db";
import { AzureContainer, AzureFunction, blobCreatedEventGridDataSchema, parseBlobSubject } from "@esposter/db-schema";
import { getDecodedUriComponent, getResultAsync, noop } from "@esposter/shared";

// Storage's own BlobCreated event is what turns a client's declared size into the truth. It arrives seconds
// After the PUT lands, carries the stored object's real length, and — unlike anything we could publish
// Ourselves — it reports what happened on a data path our servers are never part of.
// Resource assets only — the quota counts what a user keeps in their own resources, and a room's attachments
// Belong to the room. The subscription filters to this container and the handler agrees with that filter, so an
// Event from anywhere else is dropped rather than mis-attributed. See /docs/platform/storage-quotas
const STORAGE_BLOB_CONTAINERS = [AzureContainer.ResourceAssets];

export const reconcileStorageBlobHandler: EventGridHandler = (event, context) => {
  context.log(`${AzureFunction.ReconcileStorageBlob} processed subject: `, event.subject);
  return getResultAsync(async () => {
    const parsedBlobSubject = parseBlobSubject(event.subject, STORAGE_BLOB_CONTAINERS);
    if (!parsedBlobSubject) return;

    const { blobName, containerName } = parsedBlobSubject;
    const { contentLength } = blobCreatedEventGridDataSchema.parse(event.data);
    if (await reconcileStorageBlob(db, containerName, blobName, contentLength)) return;
    // A blob name reaches us through a url path, and whether storage percent-encodes it in the subject depends
    // On the characters in it — our names carry a `|` separator and a user-chosen filename. Rather than guess
    // Which form a given event used, the decoded form is tried only once the raw one has found no row.
    // A filename holding a lone `%` decodes to nothing valid, and falling back to the raw name keeps that a
    // No-op — throwing would turn an unreserved blob, which is not an error, into a poison event
    const decodedBlobName = getDecodedUriComponent(blobName, blobName);
    if (decodedBlobName !== blobName) await reconcileStorageBlob(db, containerName, decodedBlobName, contentLength);
  }).match(noop, logAndRethrow(context, AzureFunction.ReconcileStorageBlob));
};
