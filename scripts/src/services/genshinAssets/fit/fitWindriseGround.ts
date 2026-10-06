import type { GaussianHills, TerrainOptions } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitGaussianHills } from "#src/services/genshinAssets/fit/fitGaussianHills";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { createTerrainHeightSampler } from "#src/services/genshinAssets/world/createTerrainHeightSampler";
import { parseTerrainHeights } from "#src/services/genshinAssets/world/parseTerrainHeights";
import { parseTerrainTileName } from "#src/services/genshinAssets/world/parseTerrainTileName";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// How far round the origin the ground is fitted, every sample how far apart, and the distance a sample there weighs
// Half of one at the origin, in metres: the valley the screen's views see, its near ground first
const GROUND_RADIUS = 1000;
const GROUND_STEP = 6;
const GROUND_FALLOFF = 200;
// The hills' widths, widest first, down to the knolls round the oak and the statue
const GROUND_WIDTHS = [200, 120, 70, 40, 24, 14];
// The distances round the origin the fit's error is reported within
const GROUND_ERROR_BANDS = [60, 150, 300, 700];
// Windrise's ground as our Gaussian hills over its terrain tiles' heightfields, in our own axes round the oak's foot:
// Three's, x as the game's and z its mirror, every height over the foot's. Returns the hills with the heights bounding
// The ground, and the error they leave
export const fitWindriseGround = async (): Promise<{
  ground: GaussianHills & Pick<TerrainOptions, "maxHeight" | "minHeight">;
  report: string[];
}> => {
  const { world } = DerivedAssetComponentMap[DerivedAssetComponent.Windrise];
  if (!world) throw new InvalidOperationError(Operation.Read, DerivedAssetComponent.Windrise, "has no world");
  const directory = getComponentDirectory(DerivedAssetComponent.Windrise);
  const tiles = await Promise.all(
    world.terrainTiles.map(async ({ name }) => {
      const terrainHeights = parseTerrainHeights(
        await readFile(join(directory.world, AssetType.TerrainData, `${name}.dat`)),
      );
      if (!terrainHeights) throw new InvalidOperationError(Operation.Read, name, "holds no heightfield");
      const { column, row } = parseTerrainTileName(name);
      return { column, row, terrainHeights };
    }),
  );
  const getGameHeight = createTerrainHeightSampler(tiles);
  const [originX, originY, originZ] = await readWorldOrigin(DerivedAssetComponent.Windrise);
  const getHeight = (x: number, z: number): number => getGameHeight(originX + x, originZ - z) - originY;
  const { errors, hills } = fitGaussianHills({
    bands: GROUND_ERROR_BANDS,
    center: [0, 0],
    falloff: GROUND_FALLOFF,
    getHeight,
    radius: GROUND_RADIUS,
    step: GROUND_STEP,
    widths: GROUND_WIDTHS,
  });
  // The lowest and highest the ground stands within the fit, to the metre outward, which bound every tile's box
  let minHeight = Infinity;
  let maxHeight = -Infinity;
  for (let x = -GROUND_RADIUS; x <= GROUND_RADIUS; x += GROUND_STEP)
    for (let z = -GROUND_RADIUS; z <= GROUND_RADIUS; z += GROUND_STEP) {
      const height = getHeight(x, z);
      if (!Number.isFinite(height)) continue;
      minHeight = Math.min(minHeight, height);
      maxHeight = Math.max(maxHeight, height);
    }
  return {
    ground: { ...hills, maxHeight: Math.ceil(maxHeight), minHeight: Math.floor(minHeight) },
    report: [
      `ground: ${hills.hills.length} hills, ${errors.map(({ rms, within }) => `${rms} metres within ${within}`).join(", ")}`,
    ],
  };
};
