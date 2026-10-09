import type { PlantedTerrainTile } from "#src/models/PlantedTerrainTile";
import type { TerrainWorkerContext } from "#src/models/world/TerrainWorkerContext";
import type { TerrainWorkerMessage } from "#src/models/world/TerrainWorkerMessage";

import { TerrainWorkerMessageKind } from "#src/models/world/TerrainWorkerMessageKind";
import { computeWindrisePlants } from "#src/services/windrise/computeWindrisePlants";
import { WINDRISE_SEED } from "#src/services/windrise/constants";
import { createWindriseGroundPaint } from "#src/services/windrise/createWindriseGroundPaint";
import { createWorldHeight } from "#src/services/world/createWorldHeight";
import {
  computeTerrainTile,
  createGroundLayerWeights,
  createGroundPaintColor,
  getTerrainTileLevel,
} from "genshin-engine";

// What the tiles are computed with, which the world's first message to the worker loads
let context: TerrainWorkerContext | undefined;
// Generates the world's ground a tile at a time off the main thread, the plants no record places scattered on each
// Finest tile beside it, and hands each tile's arrays back without a copy. The worker lives as long as the world does,
// So its ground is loaded once, ahead of any tile, and a tile costs its heights and its plants and nothing to start
self.addEventListener("message", (event: MessageEvent<TerrainWorkerMessage>) => {
  const message = event.data;
  if (message.kind === TerrainWorkerMessageKind.Load) {
    const { baseGround, groundLayers, regionGrounds, surfaces, waterLevel } = message.ground;
    const groundPaint = createWindriseGroundPaint(groundLayers, surfaces);
    context = {
      plantsGround: {
        getHeight: createWorldHeight(baseGround, regionGrounds),
        getWeights: createGroundLayerWeights(groundPaint),
        waterLevel,
      },
      writeColor: createGroundPaintColor(groundPaint, WINDRISE_SEED + 1),
    };
    return;
  }
  // oxlint-disable-next-line error-handling/no-bare-error -- the worker cannot load `@esposter/shared` under the dev server, whose `now` reads `process.hrtime` as it loads, since `checkIsServer` takes a worker for the server
  if (!context) throw new Error("A terrain tile was asked for before the worker's ground was loaded");
  const { plantsGround, writeColor } = context;
  const { finestTileSize, key } = message.request;
  const terrainTile = computeTerrainTile({ ...message.request, getHeight: plantsGround.getHeight, writeColor });
  const { plantColors, plantMatrices } =
    getTerrainTileLevel(key) === 0
      ? computeWindrisePlants(key, finestTileSize, plantsGround)
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
