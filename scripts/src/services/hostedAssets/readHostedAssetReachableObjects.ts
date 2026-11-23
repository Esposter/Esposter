import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { HostedAssetLock, HostedAssetName } from "hosted-assets";

import { getLockRefs } from "#src/services/hostedAssets/getLockRefs";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { getHostedAssetPath } from "hosted-assets";

// Every object the locks reach in one bucket: each lock's objects and indexes, and the entries each index names. An index
// Missing from the bucket aborts the read, since a prune that could not see one would take what it names
export const readHostedAssetReachableObjects = async (
  bucketClient: R2BucketClient,
  locks: HostedAssetLock[],
): Promise<HostedAssetName[]> => {
  const { indexes, objects } = await getLockRefs(locks, async (index) => {
    const path = getHostedAssetPath(index);
    const indexJson = await bucketClient.get(path);
    if (indexJson === undefined)
      throw new InvalidOperationError(Operation.Read, path, "is named by a lock but missing from its bucket");
    return parseMachineJson(indexJson.toString("utf8"));
  });
  return [...objects, ...indexes];
};
