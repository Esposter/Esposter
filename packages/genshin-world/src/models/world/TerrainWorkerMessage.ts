import type { TerrainTileRequest } from "#src/models/TerrainTileRequest";
import type { TerrainWorkerGround } from "#src/models/world/TerrainWorkerGround";
import type { TerrainWorkerMessageKind } from "#src/models/world/TerrainWorkerMessageKind";

// A message to a terrain worker: the ground it loads before its first tile, or a tile it computes over that ground
export type TerrainWorkerMessage =
  | { ground: TerrainWorkerGround; kind: TerrainWorkerMessageKind.Load }
  | { kind: TerrainWorkerMessageKind.Tile; request: TerrainTileRequest };
