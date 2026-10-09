import type { ContainerClient } from "@azure/storage-blob";
import type { GameDataLock } from "genshin-world";

import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readJsonBlob } from "@esposter/db";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { gameDataIndexSchema } from "genshin-world";

// Every object the locks reach in one account: each lock's objects and indexes, and the entries each index names. An
// Index that is not in the account aborts the read, since a prune that could not see one would take what it names
export const readGameDataReachableHashes = async (
  containerClient: ContainerClient,
  locks: GameDataLock[],
): Promise<Set<string>> => {
  const reachableHashes = new Set<string>();
  const indexHashes = new Set<string>();
  for (const lock of locks) {
    for (const hash of Object.values(lock.objects)) reachableHashes.add(hash);
    for (const hash of Object.values(lock.indexes)) {
      reachableHashes.add(hash);
      indexHashes.add(hash);
    }
  }
  const entryHashesList = await Promise.all(
    Array.from(indexHashes, async (hash) => {
      const blobName = getGameDataBlobName(hash);
      const indexJson = await readJsonBlob(containerClient, blobName);
      if (indexJson === undefined)
        throw new InvalidOperationError(Operation.Read, blobName, "is named by a lock but missing from its account");
      return Object.values(gameDataIndexSchema.parse(parseMachineJson(indexJson.toString("utf8"))));
    }),
  );
  for (const entryHashes of entryHashesList) for (const hash of entryHashes) reachableHashes.add(hash);
  return reachableHashes;
};
