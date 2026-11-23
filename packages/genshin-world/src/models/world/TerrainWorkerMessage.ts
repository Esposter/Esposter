import type { LaidGround } from "#src/models/world/LaidGround";
import type { TerrainTileRequest } from "#src/models/world/TerrainTileRequest";
import type { TerrainWorkerGround } from "#src/models/world/TerrainWorkerGround";
import type { TerrainWorkerMessageKind } from "#src/models/world/TerrainWorkerMessageKind";

// A message to a terrain worker: the ground it loads before its first tile, the regions' grounds laid over it so far,
// Or A tile it computes over that ground
export type TerrainWorkerMessage =
  | { ground: TerrainWorkerGround; kind: typeof TerrainWorkerMessageKind.Load }
  | { kind: typeof TerrainWorkerMessageKind.RegionGrounds; laidGrounds: LaidGround[] }
  | { kind: typeof TerrainWorkerMessageKind.Tile; request: TerrainTileRequest };
