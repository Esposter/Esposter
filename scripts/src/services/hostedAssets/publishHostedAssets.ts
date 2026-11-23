import type { HostedAssetPublishResult } from "#src/models/hostedAssets/HostedAssetPublishResult";
import type { HostedAssetRecord } from "#src/models/hostedAssets/HostedAssetRecord";
import type { PublishHostedAssetsOptions } from "#src/models/hostedAssets/PublishHostedAssetsOptions";

import { HostedAssetPublishOutcome } from "#src/models/hostedAssets/HostedAssetPublishOutcome";
import { assertScopeUnclaimed } from "#src/services/hostedAssets/assertScopeUnclaimed";
import { checkNamedByScopes } from "#src/services/hostedAssets/checkNamedByScopes";
import { encodeStoredHostedAsset } from "#src/services/hostedAssets/encodeStoredHostedAsset";
import { formatHostedAssetLock } from "#src/services/hostedAssets/formatHostedAssetLock";
import { mergeHostedAssetLock } from "#src/services/hostedAssets/mergeHostedAssetLock";
import { publishHostedAssetsToBucket } from "#src/services/hostedAssets/publishHostedAssetsToBucket";
import { readHostedAssetReachableObjects } from "#src/services/hostedAssets/readHostedAssetReachableObjects";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { getOrCreate, InvalidOperationError, Operation } from "@esposter/shared";
import { getHostedAssetPath } from "hosted-assets";

// Stores what a plan names in every environment's bucket, and returns the entries it planned for the caller to merge into the
// Lock and commit. The caller commits only once this resolves: a failure in either bucket throws before then, so the committed
// Lock never names data a reader cannot fetch, and a rerun converges on the same objects. A records product's objects are
// Stored zstd-compressed, and a files product's as their extension's table names
export const publishHostedAssets = async ({
  createBucketClientMap,
  currentLock,
  otherLocks,
  plan,
  product,
  scopes,
}: PublishHostedAssetsOptions): Promise<HostedAssetPublishResult> => {
  for (const scope of scopes) assertScopeUnclaimed(scope, otherLocks);
  const plannedKeys = [...Object.keys(plan.lock.objects), ...Object.keys(plan.lock.indexes)];
  const outsideScopeKey = plannedKeys.find((key) => !checkNamedByScopes(key, scopes));
  if (outsideScopeKey !== undefined)
    throw new InvalidOperationError(Operation.Update, outsideScopeKey, "is published outside the scopes it names");
  const nextLock = mergeHostedAssetLock(product, currentLock, scopes, plan.lock);
  // A lock that stays as it is makes no request, dry or real, since each object it names was read back when it was committed
  if (formatHostedAssetLock(nextLock) === formatHostedAssetLock(currentLock))
    return { outcome: HostedAssetPublishOutcome.Unchanged };
  // A dry run stops before any bucket, so it needs no credential and writes nothing
  if (!createBucketClientMap)
    return {
      nextLock,
      outcome: HostedAssetPublishOutcome.DryRun,
      records: plan.records,
      storedObjectCount: plan.records.length,
    };
  // A publish that changes the lock lists each bucket, and stores only the objects it lacks
  const bucketClientMap = createBucketClientMap();
  const encodeStored = (record: HostedAssetRecord) => encodeStoredHostedAsset(product, record);
  const encodeMap = new Map<string, ReturnType<typeof encodeStored>>();
  // Encoded once per object and shared by both environments, which hold the same bytes
  const getEncoded = (record: HostedAssetRecord) =>
    getOrCreate(encodeMap, getHostedAssetPath(record), () => encodeStored(record));
  const publishBucket = async (bucketClient: (typeof bucketClientMap)[CloudflareEnvironment]) => {
    // A publish replaces its scopes, so an index of one of them that the bucket lacks is stored again rather than read
    const reachableObjects = await readHostedAssetReachableObjects(bucketClient, [currentLock], scopes);
    return publishHostedAssetsToBucket(bucketClient, plan.records, reachableObjects, getEncoded);
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
