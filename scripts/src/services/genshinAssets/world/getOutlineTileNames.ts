import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";
import type { WorldOrigin } from "#src/models/genshinAssets/world/WorldOrigin";

import { getOutlineTiles } from "#src/services/genshinAssets/world/getOutlineTiles";
import { getTerrainTileName } from "#src/services/genshinAssets/world/getTerrainTileName";

// The terrain tiles the areas' outlines reach, each named once in the order the outlines name them: a tile no read
// Covers Leaves its area's ground unfitted, so these are the tiles a region's export must hold
export const getOutlineTileNames = (areas: readonly GroundPieceArea[], origin: WorldOrigin): string[] => [
  ...new Set(areas.flatMap(({ outline }) => getOutlineTiles(outline, origin)).map((tile) => getTerrainTileName(tile))),
];
