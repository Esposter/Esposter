import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";
import type { TerrainTile } from "#src/models/genshinAssets/world/TerrainTile";
import type { WorldOrigin } from "#src/models/genshinAssets/world/WorldOrigin";

import { getCapitalTiles } from "#src/services/genshinAssets/world/getCapitalTiles";
import { getOutlineTileNames } from "#src/services/genshinAssets/world/getOutlineTileNames";
import { getTerrainTileName } from "#src/services/genshinAssets/world/getTerrainTileName";

// The terrain tiles a capital's world is read from, each named once: the 2x2 Windrise's ground is drawn from, and every
// Tile the region's area outlines reach, since a tile no read covers leaves its area's ground unfitted
export const getTerrainTileNames = (
  capitalTile: TerrainTile,
  areas: readonly GroundPieceArea[],
  origin: WorldOrigin,
): string[] => [
  ...new Set([
    ...getCapitalTiles(capitalTile).map((tile) => getTerrainTileName(tile)),
    ...getOutlineTileNames(areas, origin),
  ]),
];
