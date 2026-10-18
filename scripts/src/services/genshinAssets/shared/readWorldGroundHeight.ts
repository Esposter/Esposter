import type { RegionGround } from "genshin-world";

import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { readWorldBaseGrounds } from "#src/services/genshinAssets/shared/readWorldBaseGrounds";
import { createWorldHeight, regionGroundSchema, selectLaidGroundKeys } from "genshin-world";

const readRegionGround = async (key: string): Promise<RegionGround> =>
  regionGroundSchema.parse(await readPublishedGameData(key));

// The world's one ground as the scene draws it, in the world's axes round the oak's foot: Windrise's ground, its record
// Or its quarters, with every region's laid over it, each as the game data holds it
export const readWorldGroundHeight = async (): Promise<(x: number, z: number) => number> => {
  const { objects } = await readGameDataLock();
  const lockKeys = Object.keys(objects);
  const [baseGrounds, regionGrounds] = await Promise.all([
    readWorldBaseGrounds(lockKeys),
    Promise.all(selectLaidGroundKeys(lockKeys).map((key) => readRegionGround(key))),
  ]);
  return createWorldHeight(baseGrounds, regionGrounds);
};
