import type { GameDataLock } from "#src/models/data/GameDataLock";

import { GAME_DATA_MIRROR_DIRECTORY, MAX_CONCURRENT_MIRROR_DOWNLOADS } from "#scripts/gameData/mirror/constants";
import { readMirroredGameDataObject } from "#scripts/gameData/mirror/readMirroredGameDataObject";
import { gameDataIndexSchema } from "#src/models/data/GameDataIndex";
import { settleAll } from "@esposter/shared";

// Every object a lock reaches, read into the mirror: each index, then its entries and the lock's own objects, so a
// Mirror saved after it holds every record a suite can read. Resolves to how many distinct objects the mirror holds
export const fillGameDataMirror = async (
  lock: GameDataLock,
  mirrorDirectory: string = GAME_DATA_MIRROR_DIRECTORY,
): Promise<number> => {
  const indexHashes = new Set(Object.values(lock.indexes));
  const entryHashes = (
    await settleAll(
      Array.from(indexHashes, (hash) => async () => {
        const json = await readMirroredGameDataObject(hash, mirrorDirectory);
        // oxlint-disable-next-line no-restricted-properties -- the index's schema parses what it holds
        return Object.values(gameDataIndexSchema.parse(JSON.parse(json)));
      }),
      MAX_CONCURRENT_MIRROR_DOWNLOADS,
    )
  ).flat();
  // Each object is read once however many names reach it
  const objectHashes = new Set([...Object.values(lock.objects), ...entryHashes]);
  await settleAll(
    Array.from(objectHashes, (hash) => () => readMirroredGameDataObject(hash, mirrorDirectory)),
    MAX_CONCURRENT_MIRROR_DOWNLOADS,
  );
  return indexHashes.size + objectHashes.size;
};
