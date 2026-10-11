import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { createTerrainHeightSampler } from "#src/services/genshinAssets/world/createTerrainHeightSampler";
import { parseTerrainHeights } from "#src/services/genshinAssets/world/parseTerrainHeights";
import { parseTerrainTileName } from "#src/services/genshinAssets/world/parseTerrainTileName";
import { readTerrainTileFiles } from "#src/services/genshinAssets/world/readTerrainTileFiles";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The height of a part of the open world's ground at any x and z in the game's axes, read from the terrain tiles
// `extract` wrote
export const readWorldTerrainHeight = async (
  component: DerivedAssetComponent,
): Promise<(x: number, z: number) => number> => {
  const tiles = await readTerrainTileFiles(component);
  return createTerrainHeightSampler(
    tiles.map(({ data, name }) => {
      const terrainHeights = parseTerrainHeights(data);
      if (!terrainHeights) throw new InvalidOperationError(Operation.Read, name, "holds no heightfield");
      const { column, row } = parseTerrainTileName(name);
      return { column, row, terrainHeights };
    }),
  );
};
