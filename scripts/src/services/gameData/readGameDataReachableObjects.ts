import type { GameDataObjectRef } from "#src/models/gameData/GameDataObjectRef";
import type { ContainerClient } from "@azure/storage-blob";
import type { GameDataLock } from "genshin-world";

import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { toGameDataObjectRefs } from "#src/services/gameData/toGameDataObjectRefs";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readJsonBlob } from "@esposter/db";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { gameDataIndexSchema } from "genshin-world";

// Every object the locks reach in one account, each by its dataset and hash: each lock's objects and indexes, and the
// Entries each index names, which are stored under the index's own key. An index that is not in the account aborts the
// Read, since a prune that could not see one would take what it names
export const readGameDataReachableObjects = async (
  containerClient: ContainerClient,
  locks: GameDataLock[],
): Promise<GameDataObjectRef[]> => {
  // Each index is read once however many locks name it
  const indexRefMap = new Map(
    locks
      .flatMap(({ indexes }) => toGameDataObjectRefs(indexes))
      .map((ref) => [getGameDataBlobName(ref.dataset, ref.hash), ref] as const),
  );
  const entryRefsList = await Promise.all(
    Array.from(indexRefMap.values(), async ({ dataset, hash }) => {
      const blobName = getGameDataBlobName(dataset, hash);
      const indexJson = await readJsonBlob(containerClient, blobName);
      if (indexJson === undefined)
        throw new InvalidOperationError(Operation.Read, blobName, "is named by a lock but missing from its account");
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
