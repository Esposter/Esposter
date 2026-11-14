import type { Context } from "#server/trpc/context";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { ResourceInResource } from "@esposter/db-schema";

import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { withResourceObjectLock } from "#server/services/resource/snapshot/withResourceObjectLock";
import { getBucket } from "#server/services/storage/getBucket";
import { ASSET_DECISION_CLOCK_MARGIN_MS, ASSET_GRACE_MS } from "#shared/services/resource/constants";
import {
  getResourceFileBlobName,
  MAX_CONCURRENT_BLOB_COPIES,
  resourceVersionAssetsInResource,
  resourceWorkingAssetsInResource,
  StorageBucket,
} from "@esposter/db-schema";
import { noop, settleAll } from "@esposter/shared";
import { eq } from "drizzle-orm";

// A candidate written inside the grace window is kept, since an upload that dedupes onto it has just touched it and the
// Save naming it may not be stored yet. A blob already gone has no window to keep
const checkIsWithinGrace = async (bucket: R2Bucket, blobName: string) => {
  const object = await bucket.head(blobName);
  return object !== null && Date.now() - object.uploaded.getTime() < ASSET_GRACE_MS;
};
// The one release every path takes: an eviction, an unpublish, a file delete and a content write each name the asset
// Hashes they may have just left unreferenced. A candidate is deleted only when no version row and no working-copy row
// Of the resource names it, and it is outside the grace window. Under the resource's object lease, so a write reserving an
// Asset is either committed before the rows are read or not started until the release has finished
export const releaseResourceAssets = async (
  db: Context["db"],
  resourceId: ResourceInResource["id"],
  candidateHashes: string[],
): Promise<void> => {
  if (candidateHashes.length === 0) return;

  await withResourceObjectLock(db, resourceId, async () => {
    // Taken before the rows are read, so a reference written after the read is dated after this decision and its blob is kept
    const decidedAt = new Date(Date.now() - ASSET_DECISION_CLOCK_MARGIN_MS);
    const [retainedRows, workingRows] = await Promise.all([
      db
        .select({ assetHash: resourceVersionAssetsInResource.assetHash })
        .from(resourceVersionAssetsInResource)
        .where(eq(resourceVersionAssetsInResource.resourceId, resourceId)),
      db
        .select({ assetHash: resourceWorkingAssetsInResource.assetHash })
        .from(resourceWorkingAssetsInResource)
        .where(eq(resourceWorkingAssetsInResource.resourceId, resourceId)),
    ]);
    const survivors = new Set([
      ...retainedRows.map(({ assetHash }) => assetHash),
      ...workingRows.map(({ assetHash }) => assetHash),
    ]);
    const unclaimedHashes = [...new Set(candidateHashes)].filter((hash) => !survivors.has(hash));

    const bucket = getBucket(StorageBucket.ResourceAssets);
    const graceChecks = await settleAll(
      unclaimedHashes.map((hash) => async () => ({
        hash,
        isWithinGrace: await checkIsWithinGrace(bucket, getResourceFileBlobName(resourceId, hash)),
      })),
      MAX_CONCURRENT_BLOB_COPIES,
    );
    const unreferencedHashes = graceChecks.filter(({ isWithinGrace }) => !isWithinGrace).map(({ hash }) => hash);

    // Best-effort: nothing here is written, and a failed publish leaves the blob stored and charged until the next
    // Release names it again
    await publishBlobDeletion(
      StorageBucket.ResourceAssets,
      unreferencedHashes.map((hash) => getResourceFileBlobName(resourceId, hash)),
      decidedAt,
    ).match(noop, console.error);
  });
};
