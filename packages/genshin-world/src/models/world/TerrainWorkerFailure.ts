import type { TerrainWorkerMessageKind } from "#src/models/world/TerrainWorkerMessageKind";

// What a terrain worker answers a tile it could not build with: the tile's key, so the world releases the tile rather
// Than waiting on it
export interface TerrainWorkerFailure {
  key: number;
  kind: TerrainWorkerMessageKind.Failed;
}
