import type { HostedAssetLock } from "hosted-assets";

import { MAX_CONCURRENT_MIRROR_DOWNLOADS } from "#scripts/gameData/mirror/constants";
import { readMirroredGameDataObject } from "#scripts/gameData/mirror/readMirroredGameDataObject";
import { gameDataIndexSchema } from "#src/models/data/GameDataIndex";
import { getGameDataObjectName } from "#src/services/data/getGameDataObjectName";
import { ID_SEPARATOR, jsonDateParse, settleAll } from "@esposter/shared";
import { HOSTED_ASSETS_MIRROR_DIRECTORY } from "@esposter/shared-node/cache";

// Every object a lock reaches, read into the mirror: each index, then its entries and the lock's own objects, so a
// Mirror saved after it holds every record a suite can read. Each is read under the dataset it is stored under, and
// Resolves to how many distinct objects the lock names
export const fillGameDataMirror = async (
  lock: HostedAssetLock,
  mirrorDirectory: string = HOSTED_ASSETS_MIRROR_DIRECTORY,
): Promise<number> => {
  const indexRefs = Object.entries(lock.indexes).map(([dataset, { sha256 }]) => ({ dataset, hash: sha256 }));
  // An index's entries are stored under the index's own key
  const entryRefs = (
    await settleAll(
      indexRefs.map(({ dataset, hash }) => async () => {
        const json = await readMirroredGameDataObject(getGameDataObjectName(dataset, hash), mirrorDirectory);
        return Object.values(gameDataIndexSchema.parse(jsonDateParse(json))).map((entryHash) => ({
          dataset,
          hash: entryHash,
        }));
      }),
      MAX_CONCURRENT_MIRROR_DOWNLOADS,
    )
  ).flat();
  // Each object is read once however many names reach it
  const objectRefs = [
    ...Object.entries(lock.objects).map(([dataset, { sha256 }]) => ({ dataset, hash: sha256 })),
    ...entryRefs,
  ];
  const objectMap = new Map(objectRefs.map((ref) => [`${ref.dataset}${ID_SEPARATOR}${ref.hash}`, ref] as const));
  await settleAll(
    Array.from(
      objectMap.values(),
      ({ dataset, hash }) =>
        () =>
          readMirroredGameDataObject(getGameDataObjectName(dataset, hash), mirrorDirectory),
    ),
    MAX_CONCURRENT_MIRROR_DOWNLOADS,
  );
  return indexRefs.length + objectMap.size;
};
