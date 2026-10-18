import type { GroundPieceArea } from "#src/models/genshinAssets/fit/GroundPieceArea";
import type { GroundPoint } from "genshin-engine";

import { TERRAIN_NAME_PREFIX, TERRAIN_NAME_SUFFIX } from "#src/services/genshinAssets/world/constants";
import { getBoxTiles } from "#src/services/genshinAssets/world/getBoxTiles";

interface TerrainTile {
  column: number;
  row: number;
}

type Origin = [number, number, number];

// The 2x2 block Windrise's ground is drawn from: the capital's tile at its south-west corner, and the ones east of it,
// North of it and north-east of it
const getCapitalTiles = ({ column, row }: TerrainTile): TerrainTile[] => [
  { column, row },
  { column: column + 1, row },
  { column, row: row + 1 },
  { column: column + 1, row: row + 1 },
];

// The tiles an outline's bounding box reaches, in game axes from the world's origin: its x from the origin's x, its z from
// The origin's z less the outline's, each tile a kilometre a side
const getOutlineTiles = (outline: readonly GroundPoint[], [originX, , originZ]: Origin): TerrainTile[] => {
  const xs = outline.map(({ x }) => originX + x);
  const zs = outline.map(({ z }) => originZ - z);
  return getBoxTiles(Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs));
};

// The terrain tiles a capital's world is read from, each named once: the 2x2 Windrise's ground is drawn from, and every
// Tile the region's area outlines reach, since a tile no read covers leaves its area's ground unfitted
export const getTerrainTileNames = (
  capitalTile: TerrainTile,
  areas: readonly GroundPieceArea[],
  origin: Origin,
): string[] => {
  const tiles = [...getCapitalTiles(capitalTile), ...areas.flatMap(({ outline }) => getOutlineTiles(outline, origin))];
  return [...new Set(tiles.map(({ column, row }) => `${TERRAIN_NAME_PREFIX}_${column}_${row}${TERRAIN_NAME_SUFFIX}`))];
};
