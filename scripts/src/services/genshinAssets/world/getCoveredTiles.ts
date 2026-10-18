import type { GroundPoint } from "genshin-engine";

import { getBoxTiles } from "#src/services/genshinAssets/world/getBoxTiles";

// The tiles, by column and row, that the square of half side `reach` round a point touches: every tile from the one
// Holding the square's least corner to the one holding its greatest, a square edge on a tile's border taking that
// Border's far tile as well as the near one
export const getCoveredTiles = ({ x, z }: GroundPoint, reach: number): { column: number; row: number }[] =>
  getBoxTiles(x - reach, x + reach, z - reach, z + reach);
