import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { TerrainSplat } from "#src/models/genshinAssets/world/TerrainSplat";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseTerrainSplat } from "#src/services/genshinAssets/world/parseTerrainSplat";
import { parseTerrainTileName } from "#src/services/genshinAssets/world/parseTerrainTileName";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Each terrain tile `extract` wrote for a part of the open world, by its name, column and row, with its splat database,
// Leaving out a tile that lists no layers
export const readTerrainSplats = async (
  component: DerivedAssetComponent,
): Promise<{ column: number; name: string; row: number; splat: TerrainSplat }[]> => {
  const world = await readWorldOptions(component);
  if (!world) throw new InvalidOperationError(Operation.Read, component, "has no world");
  const directory = getComponentDirectory(component);
  const tiles = await Promise.all(
    world.terrainTiles.map(async ({ name }) => {
      const splat = parseTerrainSplat(await readFile(join(directory.world, AssetType.TerrainData, `${name}.dat`)));
      return splat ? [{ ...parseTerrainTileName(name), name, splat }] : [];
    }),
  );
  return tiles.flat();
};
