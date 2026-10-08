import type { TerrainOptions } from "#src/models/terrain/TerrainOptions";

import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";

// Whether a tile casts shadows: a level whose range reaches no farther from the eye than the sun's shadows do casts,
// And the rings past that reach draw into none of the shadow maps, so the ground they hold costs no shadow pass
export const checkTerrainTileCasts = (
  { finestRange }: Pick<TerrainOptions, "finestRange">,
  key: number,
  shadowReach: number,
): boolean => finestRange * 2 ** getTerrainTileLevel(key) <= shadowReach;
