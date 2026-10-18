import type { TerrainTile } from "#src/models/genshinAssets/world/TerrainTile";

// The 2x2 block Windrise's ground is drawn from: the capital's tile at its south-west corner, and the ones east of it,
// North of it and north-east of it
export const getCapitalTiles = ({ column, row }: TerrainTile): TerrainTile[] => [
  { column, row },
  { column: column + 1, row },
  { column, row: row + 1 },
  { column: column + 1, row: row + 1 },
];
