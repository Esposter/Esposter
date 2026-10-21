import type { Transaction } from "#server/models/db/Transaction";
import type { Context } from "#server/trpc/context";
import type { ContainerClient } from "@azure/storage-blob";
import type { ResourceInResource } from "@esposter/db-schema";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { publishBlobDeletion } from "#server/services/azure/eventGrid/publishBlobDeletion";
import { lockSnapshotObjects } from "#server/services/resource/snapshot/lockSnapshotObjects";
import {
  ASSET_DECISION_CLOCK_MARGIN_MS,
  ASSET_GRACE_MS,
  checkIsAssetCollectionEnabled,
} from "#shared/services/resource/constants";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { checkIsNotFound } from "@esposter/db";
import {
  AzureContainer,
  MAX_CONCURRENT_BLOB_COPIES,
  resourceVersionAssetsInResource,
  resourceWorkingAssetsInResource,
} from "@esposter/db-schema";
import { getResultAsync, noop, settleAll } from "@esposter/shared";
import { eq } from "drizzle-orm";

// A candidate written inside the grace window is kept, since an upload that dedupes onto it has just touched it and the
// Save naming it may not be stored yet. A blob already gone has no window to keep
const checkIsWithinGrace = async (containerClient: ContainerClient, blobName: string) => {
  const lastModified = await getResultAsync(() => containerClient.getBlobClient(blobName).getProperties()).match(
    (properties) => properties.lastModified,
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
  return lastModified !== undefined && Date.now() - lastModified.getTime() < ASSET_GRACE_MS;
};
// The one release every path takes: an eviction, an unpublish, a file delete and a content write each name the asset
// Hashes they may have just left unreferenced. A candidate is deleted only when no version row and no working-copy row
// Of the resource names it, and it is outside the grace window. Under the resource's object lock, so a write reserving
// An asset is either committed before the rows are read or not started until the release has finished
export const releaseResourceAssets = async (
  db: Context["db"] | Transaction,
  resourceId: ResourceInResource["id"],
  candidateHashes: string[],
): Promise<void> => {
  if (candidateHashes.length === 0) return;

  // Taken before the rows are read, so a reference written after the read is dated after this decision and its blob is kept
  const decidedAt = new Date(Date.now() - ASSET_DECISION_CLOCK_MARGIN_MS);
  const unreferencedHashes = await db.transaction(async (tx) => {
    await lockSnapshotObjects(tx, resourceId);
    const retainedRows = await tx
      .select({ assetHash: resourceVersionAssetsInResource.assetHash })
      .from(resourceVersionAssetsInResource)
      .where(eq(resourceVersionAssetsInResource.resourceId, resourceId));
    const workingRows = await tx
      .select({ assetHash: resourceWorkingAssetsInResource.assetHash })
      .from(resourceWorkingAssetsInResource)
      .where(eq(resourceWorkingAssetsInResource.resourceId, resourceId));
    const survivors = new Set([
      ...retainedRows.map(({ assetHash }) => assetHash),
      ...workingRows.map(({ assetHash }) => assetHash),
    ]);
    const unclaimedHashes = [...new Set(candidateHashes)].filter((hash) => !survivors.has(hash));

    const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
    const graceChecks = await settleAll(
      unclaimedHashes.map((hash) => async () => ({
        hash,
        isWithinGrace: await checkIsWithinGrace(containerClient, getResourceFileBlobName(resourceId, hash)),
      })),
      MAX_CONCURRENT_BLOB_COPIES,
    );
    return graceChecks.filter(({ isWithinGrace }) => !isWithinGrace).map(({ hash }) => hash);
  });

  // Counting-only computes the same set and deletes none of it, so a period of counting shows what collection would
  // Have taken before it is allowed to take anything
  if (!checkIsAssetCollectionEnabled()) {
    console.info("unreferenced assets counted", { count: unreferencedHashes.length, resourceId });
    return;
  }
  // Best-effort and after the transaction: nothing here is written, and a failed publish leaves the blob stored and
  // Charged until the next release names it again
  await publishBlobDeletion(
    resourceId,
    AzureContainer.ResourceAssets,
    unreferencedHashes.map((hash) => getResourceFileBlobName(resourceId, hash)),
    decidedAt,
  ).match(noop, console.error);
};
