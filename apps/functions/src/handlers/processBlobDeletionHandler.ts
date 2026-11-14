import { db } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { dropBlobNamesWrittenAfter } from "#src/services/storage/dropBlobNamesWrittenAfter";
import { getBucket } from "#src/services/storage/getBucket";
import { deleteStorageBlobs, listBlobNames } from "@esposter/db";
import { blobDeletionQueueMessageSchema, QueueJob } from "@esposter/db-schema";

// A read SAS url outlives the delete request that should have invalidated it, so a blob whose delete was dropped stays
// Downloadable to anyone still holding one. That makes the delete an effect whose loss is unacceptable: it is sent
// As a message and retried here until it lands, rather than logged away at the call site. A throw is that retry.
export const processBlobDeletionHandler = async (body: unknown): Promise<void> => {
  const data = blobDeletionQueueMessageSchema.parse(body);
  // Log the container, not the payload: a deletion message can carry hundreds of blob names, so the full array would be
  // Written out verbatim on every delivery.
  console.log(`${QueueJob.ProcessBlobDeletion} processing container: `, data.containerName);
  const bucket = getBucket(data.containerName);
  // A prefix message carries an unbounded set the publisher could not afford to enumerate on its request path,
  // So the walk happens here — where a retry costs nothing and the time budget is the worker's, not a user's.
  // Bounded by the publisher's own instant, so a retry deletes the set that existed when the deletion was
  // Decided rather than whatever the prefix holds now — a resource republished in between keeps its new blobs
  // A named deletion decided at `decidedAt` drops any blob written since, so a retry never deletes a re-uploaded one
  const blobNames =
    "blobNames" in data
      ? await dropBlobNamesWrittenAfter(bucket, data.blobNames, data.decidedAt)
      : await listBlobNames(bucket, data.prefix, { createdBefore: data.createdBefore });
  if ("blobNames" in data && data.decidedAt)
    console.log(
      `${QueueJob.ProcessBlobDeletion} kept ${data.blobNames.length - blobNames.length} blobs written after their deletion was decided.`,
    );
  // The delete and the release of the bytes it frees are one operation, waved and retried together — see
  // `deleteStorageBlobs` and openspec/specs/resource/storage-quotas/design.md
  await deleteStorageBlobs(db, bucket, data.containerName, blobNames, (releasedUserIds) =>
    broadcastStorageUsage(releasedUserIds),
  );
  console.log(`${QueueJob.ProcessBlobDeletion} deleted ${blobNames.length} blobs from ${data.containerName}.`);
};
