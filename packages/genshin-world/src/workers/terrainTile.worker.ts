import type { PlantedTerrainTile } from "#src/models/PlantedTerrainTile";
import type { TerrainTileRequest } from "#src/models/TerrainTileRequest";
import type { TerrainWorkerContext } from "#src/models/world/TerrainWorkerContext";
import type { TerrainWorkerFailure } from "#src/models/world/TerrainWorkerFailure";
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
// Tiles asked for before the ground loads, answered in the order they came once it does
const queuedRequests: TerrainTileRequest[] = [];
// Builds a tile's heights and its plants over the ground
const buildPlantedTerrainTile = (
  request: TerrainTileRequest,
  { plantsGround, writeColor }: TerrainWorkerContext,
): PlantedTerrainTile => {
  const { finestTileSize, key } = request;
  const terrainTile = computeTerrainTile({ ...request, getHeight: plantsGround.getHeight, writeColor });
  const { plantColors, plantMatrices } =
    getTerrainTileLevel(key) === 0
      ? computeWindrisePlants(key, finestTileSize, plantsGround)
      : { plantColors: new Float32Array(), plantMatrices: new Float32Array() };
  return { ...terrainTile, plantColors, plantMatrices };
};
// The worker cannot load `@esposter/shared`, so a build that throws is read as a rejection by allSettled rather than
// Through its getResult. A tile that fails is answered with its key, so the world releases it instead of waiting on it
const answerTile = async (request: TerrainTileRequest, terrainWorkerContext: TerrainWorkerContext) => {
  const [outcome] = await Promise.allSettled([
    Promise.try(() => buildPlantedTerrainTile(request, terrainWorkerContext)),
  ]);
  if (outcome.status === "rejected") {
    console.error(outcome.reason);
    const failure: TerrainWorkerFailure = { key: request.key, kind: TerrainWorkerMessageKind.Failed };
    // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a Worker's postMessage takes no origin
    self.postMessage(failure);
    return;
  }
  const { coarseColors, coarseNormals, coarsePositions, colors, normals, plantColors, plantMatrices, positions } =
    outcome.value;
  // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a Worker's postMessage takes no origin
  self.postMessage(outcome.value, {
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
};
// Generates the world's ground a tile at a time off the main thread, the plants no record places scattered on each
// Finest tile beside it, and hands each tile's arrays back without a copy. The worker lives as long as the world does,
// So its ground is loaded once, ahead of any tile, and a tile costs its heights and its plants and nothing to start
self.addEventListener("message", async (event: MessageEvent<TerrainWorkerMessage>) => {
  const message = event.data;
  if (message.kind === TerrainWorkerMessageKind.Load) {
    const { baseGround, groundLayers, regionGrounds, surfaces, waterLevel } = message.ground;
    const groundPaint = createWindriseGroundPaint(groundLayers, surfaces);
    const loadedContext: TerrainWorkerContext = {
      plantsGround: {
        getHeight: createWorldHeight(baseGround, regionGrounds),
        getWeights: createGroundLayerWeights(groundPaint),
        waterLevel,
      },
      writeColor: createGroundPaintColor(groundPaint, WINDRISE_SEED + 1),
    };
    context = loadedContext;
    // Each tile's build runs as it is called and posts in the order they were, so the queue is answered in order
    await Promise.all(queuedRequests.splice(0).map((request) => answerTile(request, loadedContext)));
    return;
  }
  if (!context) {
    queuedRequests.push(message.request);
    return;
  }
  await answerTile(message.request, context);
});
