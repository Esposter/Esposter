import type { RegionGround } from "genshin-world";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { createWorldHeight, GameDataset, regionGroundSchema, selectLaidGroundKeys } from "genshin-world";

const readRegionGround = async (key: string): Promise<RegionGround> =>
  regionGroundSchema.parse(await readPublishedGameData(key));

// The world's one ground as the scene draws it, in the world's axes round the oak's foot: Windrise's ground with every
// Region's laid over it, each as the game data holds it
export const readWorldGroundHeight = async (): Promise<(x: number, z: number) => number> => {
  const { objects } = await readGameDataLock();
  const [baseGround, regionGrounds] = await Promise.all([
    readRegionGround(`${GameDataset.Ground}/${DerivedAssetComponent.Windrise}`),
    Promise.all(selectLaidGroundKeys(Object.keys(objects)).map((key) => readRegionGround(key))),
  ]);
  return createWorldHeight(baseGround, regionGrounds);
};
