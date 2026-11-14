import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { GameDataPublishResult } from "#src/models/gameData/GameDataPublishResult";
import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { PublishGameDataOptions } from "#src/models/gameData/PublishGameDataOptions";

import { GameDataPublishOutcome } from "#src/models/gameData/GameDataPublishOutcome";
import { formatGameDataLock } from "#src/services/gameData/formatGameDataLock";
import { mergeGameDataLock } from "#src/services/gameData/mergeGameDataLock";
import { planGameDataPublication } from "#src/services/gameData/planGameDataPublication";
import { publishGameDataToBucket } from "#src/services/gameData/publishGameDataToBucket";
import { readGameDataReachableObjects } from "#src/services/gameData/readGameDataReachableObjects";
import { compressZstd } from "@esposter/db";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { DEFAULT_COMPRESSION_LEVEL, InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// Stores what a publication names in every environment's bucket, and returns the entries it planned for the caller to merge
// Into the lock and commit. The caller commits only once this resolves: a failure in either bucket throws before then, so the
// Committed lock never names data a reader cannot fetch, and a rerun converges on the same objects.
export const publishGameData = async ({
  createBucketClientMap,
  currentLock,
  publication,
  scopes,
}: PublishGameDataOptions): Promise<GameDataPublishResult> => {
  const plan = planGameDataPublication(publication);
  const plannedKeys = [...Object.keys(plan.lock.objects), ...Object.keys(plan.lock.indexes)];
  const outsideScopeKey = plannedKeys.find(
    (key) => !scopes.some((scope) => scope === key || scope === takeOne(key.split("/"))),
  );
  if (outsideScopeKey !== undefined)
    throw new InvalidOperationError(Operation.Update, outsideScopeKey, "is published outside the scopes it names");
  const nextLock = mergeGameDataLock(currentLock, scopes, plan.lock);
  const isLockUnchanged = formatGameDataLock(nextLock) === formatGameDataLock(currentLock);
  // A dry run stops before any bucket, so it needs no credential and writes nothing
  if (!createBucketClientMap) {
    if (isLockUnchanged) return { outcome: GameDataPublishOutcome.Unchanged };
    return {
      nextLock,
      outcome: GameDataPublishOutcome.DryRun,
      records: plan.records,
      storedObjectCount: plan.records.length,
    };
  }
  // A publication that stores no object and leaves the lock as it is returns before any bucket is made, so it lists none
  // And needs no credential. Any other real publish lists each bucket, since the lock can name an object a bucket has lost,
  // And each bucket stores only the objects it lacks
  if (plan.records.length === 0 && isLockUnchanged) return { outcome: GameDataPublishOutcome.Empty };
  const bucketClientMap = createBucketClientMap();
  const compressedJsonMap = new Map<string, Promise<Buffer>>();
  // Compressed once per object and shared by both environments, which hold the same bytes
  const getCompressedJson = (record: GameDataRecord) => {
    const compressedJson = compressedJsonMap.get(record.hash) ?? compressZstd(record.json, DEFAULT_COMPRESSION_LEVEL);
    compressedJsonMap.set(record.hash, compressedJson);
    return compressedJson;
  };
  const publishBucket = async (bucketClient: R2BucketClient) => {
    const reachableObjects = await readGameDataReachableObjects(bucketClient, [currentLock]);
    return publishGameDataToBucket(bucketClient, plan.records, reachableObjects, getCompressedJson);
  };
  const [devCount, prodCount] = await Promise.all([
    publishBucket(bucketClientMap[CloudflareEnvironment.Development]),
    publishBucket(bucketClientMap[CloudflareEnvironment.Production]),
  ]);
  return {
    outcome: GameDataPublishOutcome.Published,
    plannedLock: plan.lock,
    storedObjectCount: plan.records.length,
    uploadedCountMap: { [CloudflareEnvironment.Development]: devCount, [CloudflareEnvironment.Production]: prodCount },
  };
};
