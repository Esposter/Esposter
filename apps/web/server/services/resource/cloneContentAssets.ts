import type { ResourceAccess } from "#server/models/resource/ResourceAccess";
import type { ResourceAssetPath } from "#shared/models/resource/ResourceAssetPath";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { Database, ResourceInResource } from "@esposter/db-schema";

import { checkIsResourceAssetReadable } from "#server/services/resource/checkIsResourceAssetReadable";
import { collectResourceAssetPaths } from "#server/services/resource/collectResourceAssetPaths";
import { readResourceAccess } from "#server/services/resource/readResourceAccess";
import { getSnapshotAssetHashes } from "#server/services/resource/snapshot/getSnapshotAssetHashes";
import { emitStorageUsage } from "#server/services/storage/emitStorageUsage";
import { getBucket } from "#server/services/storage/getBucket";
import { RESOURCE_ASSET_URL_REGEX } from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { deepReplaceStrings } from "#shared/util/object/deepReplaceStrings";
import { chargeAndCopyBlob } from "@esposter/db";
import { getResourceFileBlobName, MAX_CONCURRENT_BLOB_COPIES, StorageBucket } from "@esposter/db-schema";
import { getOrCreate, getResultAsync, settleAll } from "@esposter/shared";

// Copies one asset to the destination under the same hash.
// A destination that already holds the hash is the same bytes, so nothing is copied or charged.
// Returns whether the destination now holds the asset.
// A source the bucket cannot find reads as missing, like every other reference the clone cannot follow.
const cloneAsset = async (
  db: Database,
  userId: string,
  bucket: R2Bucket,
  blobName: string,
  destinationBlobName: string,
): Promise<boolean> => {
  if (await bucket.head(destinationBlobName)) return true;

  // One HEAD answers both questions the copy needs.
  // It says whether the source is there, and what the clone costs its new owner.
  // A failed HEAD is logged as it falls back to a missing source.
  // So a flaky read is visible rather than a missing asset.
  const sourceObject = await getResultAsync(() => bucket.head(blobName))
    .orTee(console.error)
    .unwrapOr(null);
  if (!sourceObject) return false;

  await chargeAndCopyBlob(
    db,
    userId,
    StorageBucket.ResourceAssets,
    bucket,
    blobName,
    destinationBlobName,
    sourceObject.size,
  );
  return true;
};

// Duplicate's clone holds every asset the caller can read that the content names, under the destination's own hash.
// A url names its file by path.
// A bare id (a whiteboard image) names a file of the source resource by its hash alone.
// So every hash the content carries is a candidate too.
// The content is rewritten to the destination's url where a url named the file.
// A url the caller cannot read, or one that is not an asset address, is carried verbatim.
// So a shared blueprint keeps rendering for whoever can already see its assets.
export const cloneContentAssets = async <TContent>(
  db: Database,
  userId: string,
  content: TContent,
  sourceResourceId: ResourceInResource["id"],
  destinationResourceId: ResourceInResource["id"],
): Promise<TContent> => {
  const { content: relativizedContent, resourceAssetPaths } = collectResourceAssetPaths(content);
  // A hash a url already names is the same blob, which that url copies and rewrites, so it is not a second candidate
  const urlBlobNames = new Set(Array.from(resourceAssetPaths.values(), ({ blobName }) => blobName));
  const candidates: { resourceAssetPath: ResourceAssetPath; url?: string }[] = [
    ...Array.from(resourceAssetPaths, ([url, resourceAssetPath]) => ({ resourceAssetPath, url })),
    ...Array.from(getSnapshotAssetHashes(JSON.stringify(content)), (hash) => ({
      resourceAssetPath: {
        blobName: getResourceFileBlobName(sourceResourceId, hash),
        hash,
        resourceId: sourceResourceId,
      },
    })).filter(({ resourceAssetPath }) => !urlBlobNames.has(resourceAssetPath.blobName)),
  ];
  if (candidates.length === 0) return relativizedContent;

  const bucket = getBucket(StorageBucket.ResourceAssets);
  // The promise is stored rather than its value, so the assets checked concurrently below share one read per resource
  const resourceIdAccessMap = new Map<ResourceInResource["id"], Promise<ResourceAccess>>();
  const clonableAssets = (
    await Promise.all(
      candidates.map(async ({ resourceAssetPath, url }) => {
        const resourceAccess = await getOrCreate(resourceIdAccessMap, resourceAssetPath.resourceId, () =>
          readResourceAccess(db, resourceAssetPath.resourceId, userId),
        );
        if (!(await checkIsResourceAssetReadable(db, resourceAssetPath, resourceAccess))) return [];
        return [
          {
            blobName: resourceAssetPath.blobName,
            destinationBlobName: getResourceFileBlobName(destinationResourceId, resourceAssetPath.hash),
            url,
          },
        ];
      }),
    )
  ).flat();
  // Bounded waves rather than `Promise.all`, since content naming hundreds of assets would open that many connections.
  // Throttling would then fail the whole duplicate.
  // `settleAll` so a copy still in flight never lands after the caller has rolled the destination back.
  const clonedEntries = await settleAll(
    clonableAssets.map(({ blobName, destinationBlobName, url }) => async () => ({
      destinationBlobName,
      isHeld: await cloneAsset(db, userId, bucket, blobName, destinationBlobName),
      url,
    })),
    MAX_CONCURRENT_BLOB_COPIES,
  );

  const heldEntries = clonedEntries.filter(({ isHeld }) => isHeld);
  if (heldEntries.length === 0) return relativizedContent;
  // One event for the whole clone rather than one per asset: the owner's meter sees a single duplicate
  await emitStorageUsage(db, userId);
  const updatedUrlMap = new Map(
    heldEntries.flatMap(({ destinationBlobName, url }) =>
      url === undefined ? [] : [[url, getResourceAssetUrl(destinationBlobName)] as const],
    ),
  );
  return deepReplaceStrings(relativizedContent, (value) =>
    value.replaceAll(RESOURCE_ASSET_URL_REGEX, (url) => updatedUrlMap.get(url) ?? url),
  );
};
