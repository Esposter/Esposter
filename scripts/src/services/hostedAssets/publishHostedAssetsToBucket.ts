import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { HostedAssetRecord } from "#src/models/hostedAssets/HostedAssetRecord";
import type { HostedAssetName } from "hosted-assets";

import {
  HOSTED_ASSET_REUSE_WINDOW_MS,
  MAX_CONCURRENT_OBJECT_BODIES,
  MAX_CONCURRENT_VERIFY_FETCHES,
} from "#src/services/hostedAssets/constants";
import { putHostedAsset } from "#src/services/hostedAssets/putHostedAsset";
import { readBucketLastModifiedMap } from "#src/services/hostedAssets/readBucketLastModifiedMap";
import { readHostedAssetBytes } from "#src/services/hostedAssets/readHostedAssetBytes";
import { toHostedAssetLockObject } from "#src/services/hostedAssets/toHostedAssetLockObject";
import { toHostedAssetPaths } from "#src/services/hostedAssets/toHostedAssetPaths";
import { settleAll } from "@esposter/shared";
import { getHostedAssetPath } from "hosted-assets";

// Stores what one bucket does not hold yet, and returns how many objects it wrote. A stored object is reused as it is
// When The current lock reaches it or it is young, and otherwise rewritten with the same bytes, which restarts its age
// So no Prune can take it. Leaves are written before the indexes that name them, so an index never names a missing
// Entry
export const publishHostedAssetsToBucket = async (
  bucketClient: R2BucketClient,
  records: HostedAssetRecord[],
  reachableObjects: HostedAssetName[],
  getEncoded: (record: HostedAssetRecord) => Promise<{ body: Uint8Array; contentEncoding?: string | undefined }>,
): Promise<number> => {
  const lastModifiedMap = await readBucketLastModifiedMap(bucketClient);
  const reachablePaths = toHostedAssetPaths(reachableObjects);
  const now = Date.now();
  const writes = records
    .map((record) => ({ key: getHostedAssetPath(record), record }))
    .filter(({ key }) => {
      const lastModified = lastModifiedMap.get(key);
      return (
        lastModified === undefined ||
        !(reachablePaths.has(key) || now - lastModified.getTime() < HOSTED_ASSET_REUSE_WINDOW_MS)
      );
    })
    .map(({ key, record }) => ({ isCreateOnly: !lastModifiedMap.has(key), key, record }));
  const writeRecord = async ({ isCreateOnly, record }: (typeof writes)[number]) =>
    putHostedAsset(bucketClient, record, await getEncoded(record), isCreateOnly);
  const leafWrites = writes.filter(({ record }) => !record.isIndex);
  const indexWrites = writes.filter(({ record }) => record.isIndex);
  const leafResults = await settleAll(
    leafWrites.map((write) => () => writeRecord(write)),
    MAX_CONCURRENT_OBJECT_BODIES,
  );
  const indexResults = await settleAll(
    indexWrites.map((write) => () => writeRecord(write)),
    MAX_CONCURRENT_OBJECT_BODIES,
  );
  // What this run stores, and what the lock newly names, is read back from the bucket and checked against its name,
  // Written or Reused, so a bucket that stored other bytes under a name fails the publish before the lock that names
  // Them is committed. An object the current lock already names was checked when that lock was committed, so it is not
  // Read again
  const writtenPaths = new Set(writes.map(({ key }) => key));
  const readBackRecords = records.filter((record) => {
    const key = getHostedAssetPath(record);
    return writtenPaths.has(key) || !reachablePaths.has(key);
  });
  await settleAll(
    readBackRecords.map((record) => () => readHostedAssetBytes(bucketClient, toHostedAssetLockObject(record))),
    MAX_CONCURRENT_VERIFY_FETCHES,
  );
  return [...leafResults, ...indexResults].filter(Boolean).length;
};
