import { TERRAIN_NAME_PREFIX, TERRAIN_NAME_SUFFIX } from "#src/services/genshinAssets/world/constants";

// The terrain tiles a capital's ground is fitted from: its own tile and the ones east of it, north of it and north-east
// Of it, the 2x2 block Windrise's ground is drawn from, the capital's tile at its south-west corner
export const getTerrainTileNames = ({ column, row }: { column: number; row: number }): string[] =>
  [
    [column, row],
    [column + 1, row],
    [column, row + 1],
    [column + 1, row + 1],
  ].map(([tileColumn, tileRow]) => `${TERRAIN_NAME_PREFIX}_${tileColumn}_${tileRow}${TERRAIN_NAME_SUFFIX}`);
