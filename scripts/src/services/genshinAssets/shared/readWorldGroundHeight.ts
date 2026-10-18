import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedRegionGround } from "#src/services/genshinAssets/shared/readPublishedRegionGround";
import { readWorldBaseGrounds } from "#src/services/genshinAssets/shared/readWorldBaseGrounds";
import { createWorldHeight, selectLaidGroundKeys } from "genshin-world";

// The world's one ground as the scene draws it, in the world's axes round the oak's foot: Windrise's ground, its record
// Or its quarters, with every region's laid over it through the selection the runtime lays by, each as the game data
// Holds it
export const readWorldGroundHeight = async (): Promise<(x: number, z: number) => number> => {
  const { objects } = await readGameDataLock();
  const lockKeys = Object.keys(objects);
  const [baseGrounds, regionGrounds] = await Promise.all([
    readWorldBaseGrounds(lockKeys),
    Promise.all(selectLaidGroundKeys(lockKeys).map((key) => readPublishedRegionGround(key))),
  ]);
  return createWorldHeight(baseGrounds, regionGrounds);
};
