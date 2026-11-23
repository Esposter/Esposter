import type { HostedAssetLock } from "hosted-assets";

import { MAX_CONCURRENT_MIRROR_DOWNLOADS } from "#scripts/gameData/mirror/constants";
import { readMirroredGameDataObject } from "#scripts/gameData/mirror/readMirroredGameDataObject";
import { getGameDataObjectName } from "#src/services/data/getGameDataObjectName";
import { readGameDataReachableRefs } from "#src/services/data/readGameDataReachableRefs";
import { jsonDateParse, settleAll } from "@esposter/shared";
import { HOSTED_ASSETS_MIRROR_DIRECTORY } from "@esposter/shared-node/cache";

// Every object a lock reaches, read into the mirror: each index, then the lock's own objects and the entries those
// Indexes name, so a mirror saved after it holds every record a suite can read. Resolves to how many distinct objects
// the lock names
export const fillGameDataMirror = async (
  lock: HostedAssetLock,
  mirrorDirectory: string = HOSTED_ASSETS_MIRROR_DIRECTORY,
): Promise<number> => {
  const { indexes, objects } = await readGameDataReachableRefs([lock], async (index) =>
    jsonDateParse(await readMirroredGameDataObject(getGameDataObjectName(index.dataset, index.hash), mirrorDirectory)),
  );
  await settleAll(
    objects.map(
      (ref) => () => readMirroredGameDataObject(getGameDataObjectName(ref.dataset, ref.hash), mirrorDirectory),
    ),
    MAX_CONCURRENT_MIRROR_DOWNLOADS,
  );
  return indexes.length + objects.length;
};
