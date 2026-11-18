import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readCatalogueRegions } from "#src/services/genshinAssets/shared/readCatalogueRegions";
import { readPublishedRegionGround } from "#src/services/genshinAssets/shared/readPublishedRegionGround";
import { readWorldBaseGrounds } from "#src/services/genshinAssets/shared/readWorldBaseGrounds";
import { createWorldHeight, selectLaidGroundKeys, toLaidGround } from "genshin-world";

// The world's one ground as the scene draws it, in the world's axes round the oak's foot: Windrise's ground, its record
// Or its quarters, with every region's laid over it through the selection the runtime lays by, each as the game data
// Holds it, and each piece as the surface of its own outline
export const readWorldGroundHeight = async (): Promise<(x: number, z: number) => number> => {
  const { objects } = await readGameDataLock();
  const lockKeys = Object.keys(objects);
  const [baseGrounds, regions] = await Promise.all([readWorldBaseGrounds(lockKeys), readCatalogueRegions()]);
  const laidGrounds = await Promise.all(
    selectLaidGroundKeys(lockKeys).map(async (key) => toLaidGround(key, await readPublishedRegionGround(key), regions)),
  );
  return createWorldHeight(baseGrounds, laidGrounds);
};
