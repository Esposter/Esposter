import type { TerrainTileRequest } from "#src/models/TerrainTileRequest";

import { getWindriseHeight } from "#src/services/windrise/getWindriseHeight";
import { writeWindriseColor } from "#src/services/windrise/writeWindriseColor";
import { computeTerrainTile } from "genshin-engine";

// Generates the region's ground a tile at a time off the main thread, and hands each tile's arrays back without a
// Copy. The worker lives as long as the world does, so a tile costs its heights and nothing to start
self.addEventListener("message", (event: MessageEvent<TerrainTileRequest>) => {
  const terrainTile = computeTerrainTile({
    ...event.data,
    getHeight: getWindriseHeight,
    writeColor: writeWindriseColor,
  });
  const { coarsePositions, colors, normals, positions } = terrainTile;
  // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a Worker's postMessage takes no origin
  self.postMessage(terrainTile, {
    transfer: [coarsePositions.buffer, colors.buffer, normals.buffer, positions.buffer],
  });
});
