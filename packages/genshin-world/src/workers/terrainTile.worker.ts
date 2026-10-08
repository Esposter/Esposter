import type { PlantedTerrainTile } from "#src/models/PlantedTerrainTile";
import type { TerrainTileRequest } from "#src/models/TerrainTileRequest";

import { computeWindrisePlants } from "#src/services/windrise/computeWindrisePlants";
import { writeWindriseColor } from "#src/services/windrise/writeWindriseColor";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { computeTerrainTile, getTerrainTileLevel } from "genshin-engine";

// Generates the world's ground a tile at a time off the main thread, the plants no record places scattered on each
// Finest tile beside it, and hands each tile's arrays back without a copy. The worker lives as long as the world does,
// So a tile costs its heights and its plants and nothing to start
self.addEventListener("message", (event: MessageEvent<TerrainTileRequest>) => {
  const { finestTileSize, key } = event.data;
  const terrainTile = computeTerrainTile({ ...event.data, getHeight: getWorldHeight, writeColor: writeWindriseColor });
  const { plantColors, plantMatrices } =
    getTerrainTileLevel(key) === 0
      ? computeWindrisePlants(key, finestTileSize)
      : { plantColors: new Float32Array(), plantMatrices: new Float32Array() };
  const plantedTerrainTile: PlantedTerrainTile = { ...terrainTile, plantColors, plantMatrices };
  const { coarseColors, coarseNormals, coarsePositions, colors, normals, positions } = terrainTile;
  // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a Worker's postMessage takes no origin
  self.postMessage(plantedTerrainTile, {
    transfer: [
      coarseColors.buffer,
      coarseNormals.buffer,
      coarsePositions.buffer,
      colors.buffer,
      normals.buffer,
      plantColors.buffer,
      plantMatrices.buffer,
      positions.buffer,
    ],
  });
});
