import type { TerrainTile } from "#src/models/genshinAssets/world/TerrainTile";
import type { WorldOrigin } from "#src/models/genshinAssets/world/WorldOrigin";
import type { GroundPoint } from "genshin-engine";

import { getBoxTiles } from "#src/services/genshinAssets/world/getBoxTiles";

// The tiles an outline's bounding box reaches, in game axes from the world's origin: its x from the origin's x, its z from
// The origin's z less the outline's, each tile a kilometre a side
export const getOutlineTiles = (outline: readonly GroundPoint[], [originX, , originZ]: WorldOrigin): TerrainTile[] => {
  const xs = outline.map(({ x }) => originX + x);
  const zs = outline.map(({ z }) => originZ - z);
  return getBoxTiles(Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs));
};
