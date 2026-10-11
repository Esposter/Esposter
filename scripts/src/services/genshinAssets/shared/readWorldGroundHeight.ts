import type { RegionGround } from "genshin-world";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { createWorldHeight, GameDataset, REGION_GROUND_KEYS, regionGroundSchema } from "genshin-world";

const readRegionGround = async (key: string): Promise<RegionGround> =>
  regionGroundSchema.parse(await readPublishedGameData(key));

// The world's one ground as the scene draws it, in the world's axes round the oak's foot: Windrise's ground with every
// Region's laid over it, each as the game data holds it
export const readWorldGroundHeight = async (): Promise<(x: number, z: number) => number> => {
  const [baseGround, regionGrounds] = await Promise.all([
    readRegionGround(`${GameDataset.Ground}/${DerivedAssetComponent.Windrise}`),
    Promise.all(REGION_GROUND_KEYS.map((key) => readRegionGround(key))),
  ]);
  return createWorldHeight(baseGround, regionGrounds);
};
