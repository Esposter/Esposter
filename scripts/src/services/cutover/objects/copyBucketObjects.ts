import type { BucketCopyCounts } from "#src/models/cutover/BucketCopyCounts";
import type { CopyBucketObjectsOptions } from "#src/models/cutover/CopyBucketObjectsOptions";
import type { CutoverCheckpoint } from "#src/models/cutover/CutoverCheckpoint";

import { listContainerBlobs } from "#src/services/cutover/azure/listContainerBlobs";
import { readCheckpoint } from "#src/services/cutover/checkpoint/readCheckpoint";
import { writeCheckpoint } from "#src/services/cutover/checkpoint/writeCheckpoint";
import { COPY_CONCURRENCY } from "#src/services/cutover/constants";
import { COPY_OBJECTS_UNIT_PREFIX, DELTA_CLOCK_MARGIN_MS } from "#src/services/cutover/objects/constants";
import { copyBlobIfChanged } from "#src/services/cutover/objects/copyBlobIfChanged";
import { runWithConcurrency } from "#src/services/cutover/objects/runWithConcurrency";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Copies one container into its R2 bucket. The full copy runs while the app is live and records when it began. The delta
// runs in the freeze: it copies what changed since then and deletes what Azure no longer lists. Both skip an object already
// stored with the same MD5, so a re-run redoes only what is not yet there
export const copyBucketObjects = async (options: CopyBucketObjectsOptions): Promise<BucketCopyCounts> => {
  const { archiveBucket, azure, bucket, client, delta, r2Bucket } = options;
  const unit = `${COPY_OBJECTS_UNIT_PREFIX}/${bucket}`;
  const containerClient = azure.getContainerClient(bucket);
  const checkpoint: CutoverCheckpoint = (await readCheckpoint(client, archiveBucket, unit)) ?? {};
  const counts: BucketCopyCounts = { copied: 0, deleted: 0, skipped: 0 };

  if (!delta) {
    if (checkpoint.completedAt) return counts;
    // Kept once set: the delta measures changes from this instant, so a re-run must not move it
    const preCopyStartedAt = checkpoint.preCopyStartedAt ?? new Date().toISOString();
    await writeCheckpoint(client, archiveBucket, unit, { ...checkpoint, preCopyStartedAt });
    await runWithConcurrency(listContainerBlobs(containerClient), COPY_CONCURRENCY, async (blob) => {
      if (await copyBlobIfChanged(client, containerClient, r2Bucket, blob)) counts.copied += 1;
      else counts.skipped += 1;
    });
    const completedAt = new Date().toISOString();
    await writeCheckpoint(client, archiveBucket, unit, { ...checkpoint, completedAt, preCopyStartedAt });
    return counts;
  }

  if (!checkpoint.preCopyStartedAt)
    throw new InvalidOperationError(Operation.Read, unit, "has no pre-copy to take changes from: copy-objects must run first");
  if (!checkpoint.completedAt)
    throw new InvalidOperationError(Operation.Read, unit, "has an unfinished full copy: copy-objects must finish first");
  const changedSince = Date.parse(checkpoint.preCopyStartedAt) - DELTA_CLOCK_MARGIN_MS;
  // Every name Azure lists, changed or not, so the deletes below know which R2 objects are gone from Azure
  const azureNames = new Set<string>();
  await runWithConcurrency(listContainerBlobs(containerClient), COPY_CONCURRENCY, async (blob) => {
    azureNames.add(blob.name);
    if (blob.lastModified.getTime() < changedSince) return;
    if (await copyBlobIfChanged(client, containerClient, r2Bucket, blob)) counts.copied += 1;
    else counts.skipped += 1;
  });
  await runWithConcurrency(client.listObjects(r2Bucket), COPY_CONCURRENCY, async (object) => {
    if (azureNames.has(object.key)) return;
    await client.deleteObject(r2Bucket, object.key);
    counts.deleted += 1;
  });
  await writeCheckpoint(client, archiveBucket, unit, { ...checkpoint, deltaCompletedAt: new Date().toISOString() });
  return counts;
};
