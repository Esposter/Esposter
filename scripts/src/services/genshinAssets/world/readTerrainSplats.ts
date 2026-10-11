import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { TerrainSplat } from "#src/models/genshinAssets/world/TerrainSplat";

import { parseTerrainSplat } from "#src/services/genshinAssets/world/parseTerrainSplat";
import { parseTerrainTileName } from "#src/services/genshinAssets/world/parseTerrainTileName";
import { readTerrainTileFiles } from "#src/services/genshinAssets/world/readTerrainTileFiles";

// Each terrain tile `extract` wrote for a part of the open world, by its name, column and row, with its splat database,
// Leaving out a tile that lists no layers
export const readTerrainSplats = async (
  component: DerivedAssetComponent,
): Promise<{ column: number; name: string; row: number; splat: TerrainSplat }[]> => {
  const tiles = await readTerrainTileFiles(component);
  return tiles.flatMap(({ data, name }) => {
    const splat = parseTerrainSplat(data);
    return splat ? [{ ...parseTerrainTileName(name), name, splat }] : [];
  });
};
