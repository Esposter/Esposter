import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { HostedAssetRecord } from "#src/models/hostedAssets/HostedAssetRecord";
import type { HostedAssetName } from "hosted-assets";

import {
  HOSTED_ASSET_CACHE_CONTROL,
  HOSTED_ASSET_REUSE_WINDOW_MS,
  MAX_CONCURRENT_OBJECT_BODIES,
  MAX_CONCURRENT_VERIFY_FETCHES,
} from "#src/services/hostedAssets/constants";
import { readHostedAssetBytes } from "#src/services/hostedAssets/readHostedAssetBytes";
import { toHostedAssetLockObject } from "#src/services/hostedAssets/toHostedAssetLockObject";
import { toHostedAssetPaths } from "#src/services/hostedAssets/toHostedAssetPaths";
import { settleAll } from "@esposter/shared";
import { getHostedAssetPath, HOSTED_ASSET_CONTENT_TYPES } from "hosted-assets";

// Stores what one bucket does not hold yet, and returns how many objects it wrote. A stored object is reused as it is when
// The current lock reaches it or it is young, and otherwise rewritten with the same bytes, which restarts its age so no
// Prune can take it. Leaves are written before the indexes that name them, so an index never names a missing entry
export const publishHostedAssetsToBucket = async (
  bucketClient: R2BucketClient,
  records: HostedAssetRecord[],
  reachableObjects: HostedAssetName[],
  getEncoded: (record: HostedAssetRecord) => Promise<{ body: Uint8Array; contentEncoding?: string | undefined }>,
): Promise<number> => {
  const lastModifiedMap = new Map(
    (await bucketClient.list("")).map(({ key, lastModified }) => [key, lastModified] as const),
  );
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
  const writeRecord = async ({ isCreateOnly, key, record }: (typeof writes)[number]) => {
    const { body, contentEncoding } = await getEncoded(record);
    return bucketClient.put(key, new Uint8Array(body), {
      cacheControl: HOSTED_ASSET_CACHE_CONTROL,
      contentEncoding,
      contentType: HOSTED_ASSET_CONTENT_TYPES[record.extension],
      createOnly: isCreateOnly,
    });
  };
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
  // Every object the plan names is read back from the bucket and checked against its name, written or reused, so a bucket
  // That stored other bytes under a name fails the publish before the lock that names them is committed
  await settleAll(
    records.map((record) => () => readHostedAssetBytes(bucketClient, toHostedAssetLockObject(record))),
    MAX_CONCURRENT_VERIFY_FETCHES,
  );
  return [...leafResults, ...indexResults].filter(Boolean).length;
};
