import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { createTerrainHeightSampler } from "#src/services/genshinAssets/world/createTerrainHeightSampler";
import { parseTerrainHeights } from "#src/services/genshinAssets/world/parseTerrainHeights";
import { parseTerrainTileName } from "#src/services/genshinAssets/world/parseTerrainTileName";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The height of a part of the open world's ground at any x and z in the game's axes, read from the terrain tiles
// `extract` wrote
export const readWorldTerrainHeight = async (
  component: DerivedAssetComponent,
): Promise<(x: number, z: number) => number> => {
  const { world } = DerivedAssetComponentMap[component];
  if (!world) throw new InvalidOperationError(Operation.Read, component, "has no world");
  const directory = getComponentDirectory(component);
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
  return createTerrainHeightSampler(tiles);
};
