import type { PlantedTerrainTile } from "#src/models/shared/PlantedTerrainTile";
import type { TerrainWorkerFailure } from "#src/models/world/TerrainWorkerFailure";
import type { TerrainWorkerGround } from "#src/models/world/TerrainWorkerGround";
import type { TerrainWorkerMessage } from "#src/models/world/TerrainWorkerMessage";

import { TerrainWorkerMessageKind } from "#src/models/world/TerrainWorkerMessageKind";
import { TERRAIN_WORKER_COUNT } from "#src/services/constants";
import { createTileHolders } from "#src/services/world/createTileHolders";

// The pool of terrain workers, each loaded with the ground as it starts. A tile is held by the worker it is asked of until
// That worker answers or fails it, and a worker that errors fails only the tiles it holds, so the others keep generating
export const useTerrainWorkers = ({
  createTerrainWorker,
  onTerrainTile,
  onTileFailed,
  terrainWorkerGround,
}: {
  createTerrainWorker: () => Worker;
  onTerrainTile: (terrainTile: PlantedTerrainTile) => void;
  onTileFailed: (key: number) => void;
  terrainWorkerGround: TerrainWorkerGround;
}) => {
  // Each worker is loaded with its ground as it starts. A worker takes its messages in the order they were posted, so its
  // Ground is loaded before any tile asked of it, with nothing to wait for
  const workers = Array.from({ length: TERRAIN_WORKER_COUNT }, () => {
    const worker = createTerrainWorker();
    const message: TerrainWorkerMessage = { ground: terrainWorkerGround, kind: TerrainWorkerMessageKind.Load };
    worker.postMessage(message, []);
    return worker;
  });
  const tileHolders = createTileHolders(workers.length);
  // A worker that errors, or cannot read a message, has lost the tiles it holds, so each of those is failed
  // The other workers keep generating
  const failHeldTiles = (workerIndex: number, event: Event) => {
    console.error("A terrain worker failed", event);
    for (const key of tileHolders.takeHeldKeys(workerIndex)) onTileFailed(key);
  };
  for (const [workerIndex, worker] of workers.entries()) {
    worker.addEventListener("message", (event: MessageEvent<PlantedTerrainTile | TerrainWorkerFailure>) => {
      const { data } = event;
      if (!tileHolders.checkIsHeldBy(data.key, workerIndex)) return;
      tileHolders.release(data.key);
      if ("kind" in data) onTileFailed(data.key);
      else onTerrainTile(data);
    });
    worker.addEventListener("error", (event) => failHeldTiles(workerIndex, event));
    worker.addEventListener("messageerror", (event) => failHeldTiles(workerIndex, event));
  }
  return {
    postTile: (key: number, message: TerrainWorkerMessage) => {
      workers[tileHolders.assign(key)]?.postMessage(message, []);
    },
    postToEach: (message: TerrainWorkerMessage) => {
      for (const worker of workers) worker.postMessage(message, []);
    },
    terminate: () => {
      for (const worker of workers) worker.terminate();
    },
  };
};
