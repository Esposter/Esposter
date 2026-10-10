import type { TerrainShape } from "genshin-engine";

import { readRegionGroundFiles } from "#src/services/genshinAssets/shared/readRegionGroundFiles";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { createWorldHeight, regionGroundSchema } from "genshin-world";

// The world's one ground as the scene draws it, in the world's axes round the oak's foot: Windrise's fitted base ground
// As the game data holds it, under every region's plateaus as their authored files hold them
export const readWorldGroundHeight = async (): Promise<(x: number, z: number) => number> => {
  const [baseGround, regionGroundMap] = await Promise.all([
    readWorldData<TerrainShape>("windrise/base-ground.json"),
    readRegionGroundFiles(),
  ]);
  return createWorldHeight(
    baseGround,
    Object.values(regionGroundMap).map((regionGround) => regionGroundSchema.parse(regionGround)),
  );
};
