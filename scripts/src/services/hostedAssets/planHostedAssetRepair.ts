import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { HostedAssetCopy } from "#src/models/hostedAssets/HostedAssetCopy";
import type { CloudflareEnvironment } from "@esposter/db-schema";
import type { HostedAssetLock } from "hosted-assets";

import { MAX_CONCURRENT_VERIFY_FETCHES } from "#src/services/hostedAssets/constants";
import { getLockRefs } from "#src/services/hostedAssets/getLockRefs";
import { readBucketLastModifiedMap } from "#src/services/hostedAssets/readBucketLastModifiedMap";
import { readHostedAssetBytes } from "#src/services/hostedAssets/readHostedAssetBytes";
import { toLockedBytesMap } from "#src/services/hostedAssets/toLockedBytesMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { CloudflareEnvironments } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { getHostedAssetPath } from "hosted-assets";

// The copies that bring each bucket to what the lock names: each object or index the lock reaches that one
// Environment's bucket Lacks, from the other environment's bucket, which must hold it. An index is read from whichever
// Bucket holds it, since its Entries are the objects the walk reaches. A name neither bucket holds fails the plan,
// Named by key, before any copy is made
export const planHostedAssetRepair = async (
  lock: HostedAssetLock,
  bucketClientMap: Record<CloudflareEnvironment, R2BucketClient>,
): Promise<HostedAssetCopy[]> => {
  const environmentLastModifiedMap = new Map(
    await Promise.all(
      CloudflareEnvironments.map(async (environment) => {
        const lastModifiedMap = await readBucketLastModifiedMap(bucketClientMap[environment]);
        return [environment, lastModifiedMap] as const;
      }),
    ),
  );
  const lockedBytesMap = toLockedBytesMap(lock);
  const getSource = (path: string) =>
    CloudflareEnvironments.find((environment) => environmentLastModifiedMap.get(environment)?.has(path));
  const { indexes, objects } = await getLockRefs(
    [lock],
    async (index) => {
      const path = getHostedAssetPath(index);
      const source = getSource(path);
      // An index neither bucket holds reads as empty here, and is named among the lost names below
      if (source === undefined) return {};
      const bytes = await readHostedAssetBytes(bucketClientMap[source], { ...index, bytes: lockedBytesMap.get(path) });
      return parseMachineJson(bytes.toString("utf8"));
    },
    MAX_CONCURRENT_VERIFY_FETCHES,
  );
  const copies: HostedAssetCopy[] = [];
  const lost: string[] = [];
  for (const name of [...indexes, ...objects]) {
    const path = getHostedAssetPath(name);
    const destinations = CloudflareEnvironments.filter(
      (environment) => !environmentLastModifiedMap.get(environment)?.has(path),
    );
    if (destinations.length === 0) continue;
    const source = getSource(path);
    if (source === undefined) lost.push(path);
    else
      copies.push(
        ...destinations.map((destination) => ({ bytes: lockedBytesMap.get(path), destination, name, source })),
      );
  }
  if (lost.length > 0)
    throw new InvalidOperationError(
      Operation.Read,
      lost.join(", "),
      "is named by a lock but missing from both buckets: republish the product from its source to restore it",
    );
  return copies;
};
