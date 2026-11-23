import type { HostedAssetPublishResult } from "#src/models/hostedAssets/HostedAssetPublishResult";
import type { HostedAssetRecord } from "#src/models/hostedAssets/HostedAssetRecord";
import type { PublishHostedAssetsOptions } from "#src/models/hostedAssets/PublishHostedAssetsOptions";

import { HostedAssetPublishOutcome } from "#src/models/hostedAssets/HostedAssetPublishOutcome";
import { assertScopeUnclaimed } from "#src/services/hostedAssets/assertScopeUnclaimed";
import { formatHostedAssetLock } from "#src/services/hostedAssets/formatHostedAssetLock";
import { mergeHostedAssetLock } from "#src/services/hostedAssets/mergeHostedAssetLock";
import { planHostedAssetPublication } from "#src/services/hostedAssets/planHostedAssetPublication";
import { publishHostedAssetsToBucket } from "#src/services/hostedAssets/publishHostedAssetsToBucket";
import { readHostedAssetReachableObjects } from "#src/services/hostedAssets/readHostedAssetReachableObjects";
import { compressZstd } from "@esposter/db";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { DEFAULT_COMPRESSION_LEVEL, InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// Stores what a publication names in every environment's bucket, and returns the entries it planned for the caller to merge
// Into the lock and commit. The caller commits only once this resolves: a failure in either bucket throws before then, so the
// Committed lock never names data a reader cannot fetch, and a rerun converges on the same objects.
export const publishHostedAssets = async ({
  createBucketClientMap,
  currentLock,
  otherLocks,
  product,
  publication,
  scopes,
}: PublishHostedAssetsOptions): Promise<HostedAssetPublishResult> => {
  for (const scope of scopes) assertScopeUnclaimed(scope, otherLocks);
  const plan = planHostedAssetPublication(publication);
  const plannedKeys = [...Object.keys(plan.lock.objects), ...Object.keys(plan.lock.indexes)];
  const outsideScopeKey = plannedKeys.find(
    (key) => !scopes.some((scope) => scope === key || scope === takeOne(key.split("/"))),
  );
  if (outsideScopeKey !== undefined)
    throw new InvalidOperationError(Operation.Update, outsideScopeKey, "is published outside the scopes it names");
  const nextLock = mergeHostedAssetLock(product, currentLock, scopes, plan.lock);
  const isLockUnchanged = formatHostedAssetLock(nextLock) === formatHostedAssetLock(currentLock);
  // A dry run stops before any bucket, so it needs no credential and writes nothing
  if (!createBucketClientMap) {
    if (isLockUnchanged) return { outcome: HostedAssetPublishOutcome.Unchanged };
    return {
      nextLock,
      outcome: HostedAssetPublishOutcome.DryRun,
      records: plan.records,
      storedObjectCount: plan.records.length,
    };
  }
  // A publication that stores no object and leaves the lock as it is returns before any bucket is made, so it lists none
  // And needs no credential. Any other real publish lists each bucket, since the lock can name an object a bucket has lost,
  // And each bucket stores only the objects it lacks
  if (plan.records.length === 0 && isLockUnchanged) return { outcome: HostedAssetPublishOutcome.Empty };
  const bucketClientMap = createBucketClientMap();
  const compressedJsonMap = new Map<string, Promise<Buffer>>();
  // Compressed once per object and shared by both environments, which hold the same bytes
  const getCompressedJson = (record: HostedAssetRecord) => {
    const compressedJson = compressedJsonMap.get(record.sha256) ?? compressZstd(record.json, DEFAULT_COMPRESSION_LEVEL);
    compressedJsonMap.set(record.sha256, compressedJson);
    return compressedJson;
  };
  const publishBucket = async (bucketClient: (typeof bucketClientMap)[CloudflareEnvironment]) => {
    const reachableObjects = await readHostedAssetReachableObjects(bucketClient, [currentLock]);
    return publishHostedAssetsToBucket(bucketClient, plan.records, reachableObjects, getCompressedJson);
  };
  const [devCount, prodCount] = await Promise.all([
    publishBucket(bucketClientMap[CloudflareEnvironment.Development]),
    publishBucket(bucketClientMap[CloudflareEnvironment.Production]),
  ]);
  return {
    outcome: HostedAssetPublishOutcome.Published,
    plannedLock: plan.lock,
    storedObjectCount: plan.records.length,
    uploadedCountMap: { [CloudflareEnvironment.Development]: devCount, [CloudflareEnvironment.Production]: prodCount },
  };
};
