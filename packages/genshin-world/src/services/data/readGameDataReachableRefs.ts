import type { GameDataObjectRef } from "#src/models/data/GameDataObjectRef";
import type { HostedAssetLock } from "hosted-assets";

import { gameDataIndexSchema } from "#src/models/data/GameDataIndex";
import { toGameDataObjectRefs } from "#src/services/data/toGameDataObjectRefs";
import { toUniqueGameDataObjectRefs } from "#src/services/data/toUniqueGameDataObjectRefs";
import { settleAll } from "@esposter/shared";

// Every object the locks reach: each index they name, then each object they name and each entry an index names. An
// Index's entries are stored under that index's own dataset. `readIndex` reads an index's body however its store
// Serves it, so each caller brings its own, and an index named by two locks is read once
export const readGameDataReachableRefs = async (
  locks: HostedAssetLock[],
  readIndex: (index: GameDataObjectRef) => Promise<unknown>,
): Promise<{ indexes: GameDataObjectRef[]; objects: GameDataObjectRef[] }> => {
  const indexRefs = toUniqueGameDataObjectRefs(locks.flatMap((lock) => toGameDataObjectRefs(lock.indexes)));
  const entryRefs = (
    await settleAll(
      indexRefs.map(
        (indexRef) => async () =>
          Object.values(gameDataIndexSchema.parse(await readIndex(indexRef))).map((hash) => ({
            dataset: indexRef.dataset,
            hash,
          })),
      ),
    )
  ).flat();
  return {
    indexes: indexRefs,
    objects: toUniqueGameDataObjectRefs([...locks.flatMap((lock) => toGameDataObjectRefs(lock.objects)), ...entryRefs]),
  };
};
