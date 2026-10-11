import type { WindriseBaseGround } from "#src/models/windrise/WindriseBaseGround";
import type { TerrainOptions } from "genshin-engine";

// The ground's quadtree: half-metre cells under the eye in tiles of sixteen metres, six levels out to a root tile of
// Half a kilometre drawn two kilometres away, well past where the fog closes. A level's morph runs from a tile's
// Diagonal past half its range to its range, so the finest range buys that morph about nine metres to blend over
// Beyond twice the diagonal it must clear. Every tile's box spans the heights the fitted ground stands between
export const createWindriseTerrainOptions = ({ maxHeight, minHeight }: WindriseBaseGround): TerrainOptions => ({
  cellsPerSide: 32,
  finestRange: 64,
  finestTileSize: 16,
  levelCount: 6,
  maxHeight,
  minHeight,
});
