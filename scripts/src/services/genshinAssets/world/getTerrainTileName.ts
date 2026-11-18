import type { TerrainTile } from "#src/models/genshinAssets/world/TerrainTile";

import { TERRAIN_NAME_PREFIX, TERRAIN_NAME_SUFFIX } from "#src/services/genshinAssets/world/constants";

// A tile's TerrainData name, its column and row between the prefix and the `.bin` suffix (BigWorldTerrain_1_-2.bin)
export const getTerrainTileName = ({ column, row }: TerrainTile): string =>
  `${TERRAIN_NAME_PREFIX}_${column}_${row}${TERRAIN_NAME_SUFFIX}`;
