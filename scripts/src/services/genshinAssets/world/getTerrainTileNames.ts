import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";
import type { TerrainTile } from "#src/models/genshinAssets/world/TerrainTile";
import type { WorldOrigin } from "#src/models/genshinAssets/world/WorldOrigin";

import { TERRAIN_NAME_PREFIX, TERRAIN_NAME_SUFFIX } from "#src/services/genshinAssets/world/constants";
import { getCapitalTiles } from "#src/services/genshinAssets/world/getCapitalTiles";
import { getOutlineTiles } from "#src/services/genshinAssets/world/getOutlineTiles";

// The terrain tiles a capital's world is read from, each named once: the 2x2 Windrise's ground is drawn from, and every
// Tile the region's area outlines reach, since a tile no read covers leaves its area's ground unfitted
export const getTerrainTileNames = (
  capitalTile: TerrainTile,
  areas: readonly GroundPieceArea[],
  origin: WorldOrigin,
): string[] => {
  const tiles = [...getCapitalTiles(capitalTile), ...areas.flatMap(({ outline }) => getOutlineTiles(outline, origin))];
  return [...new Set(tiles.map(({ column, row }) => `${TERRAIN_NAME_PREFIX}_${column}_${row}${TERRAIN_NAME_SUFFIX}`))];
};
