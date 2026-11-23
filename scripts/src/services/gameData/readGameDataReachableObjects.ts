import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { GameDataObjectRef } from "genshin-world";
import type { HostedAssetLock } from "hosted-assets";

import { getGameDataObjectKey } from "#src/services/gameData/getGameDataObjectKey";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readGameDataReachableRefs } from "genshin-world";

// Every object the locks reach in one bucket, each by its dataset and hash: each lock's objects and indexes, and the
// Entries each index names, stored under the index's own key. An index missing from the bucket aborts the read, since a
// Prune that could not see one would take what it names
export const readGameDataReachableObjects = async (
  bucketClient: R2BucketClient,
  locks: HostedAssetLock[],
): Promise<GameDataObjectRef[]> => {
  const { indexes, objects } = await readGameDataReachableRefs(locks, async (index) => {
    const key = getGameDataObjectKey(index);
    const indexJson = await bucketClient.get(key);
    if (indexJson === undefined)
      throw new InvalidOperationError(Operation.Read, key, "is named by a lock but missing from its bucket");
    return parseMachineJson(indexJson.toString("utf8"));
  });
  return [...objects, ...indexes];
};
