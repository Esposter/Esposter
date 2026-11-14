import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { GameDataObjectRef } from "#src/models/gameData/GameDataObjectRef";
import type { GameDataLock } from "genshin-world";

import { getGameDataObjectKey } from "#src/services/gameData/getGameDataObjectKey";
import { toGameDataObjectRefs } from "#src/services/gameData/toGameDataObjectRefs";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { gameDataIndexSchema } from "genshin-world";

// Every object the locks reach in one bucket, each by its dataset and hash: each lock's objects and indexes, and the entries
// Each index names, which are stored under the index's own key. An index that is not in the bucket aborts the read, since a
// Prune that could not see one would take what it names
export const readGameDataReachableObjects = async (
  bucketClient: R2BucketClient,
  locks: GameDataLock[],
): Promise<GameDataObjectRef[]> => {
  // Each index is read once however many locks name it
  const indexRefMap = new Map(
    locks
      .flatMap(({ indexes }) => toGameDataObjectRefs(indexes))
      .map((ref) => [getGameDataObjectKey(ref.dataset, ref.hash), ref] as const),
  );
  const entryRefsList = await Promise.all(
    Array.from(indexRefMap.values(), async ({ dataset, hash }) => {
      const key = getGameDataObjectKey(dataset, hash);
      const indexJson = await bucketClient.get(key);
      if (indexJson === undefined)
        throw new InvalidOperationError(Operation.Read, key, "is named by a lock but missing from its bucket");
      const entryHashes = Object.values(gameDataIndexSchema.parse(parseMachineJson(indexJson.toString("utf8"))));
      return entryHashes.map((entryHash) => ({ dataset, hash: entryHash }));
    }),
  );
  return [
    ...locks.flatMap(({ objects }) => toGameDataObjectRefs(objects)),
    ...indexRefMap.values(),
    ...entryRefsList.flat(),
  ];
};
