import type { TerrainTileRequest } from "#src/models/TerrainTileRequest";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { TerrainWorkerGround } from "#src/models/world/TerrainWorkerGround";
import type { TerrainWorkerMessageKind } from "#src/models/world/TerrainWorkerMessageKind";

// A message to a terrain worker: the ground it loads before its first tile, the regions' grounds laid over it so far, or
// A tile it computes over that ground
export type TerrainWorkerMessage =
  | { ground: TerrainWorkerGround; kind: TerrainWorkerMessageKind.Load }
  | { kind: TerrainWorkerMessageKind.RegionGrounds; regionGrounds: RegionGround[] }
  | { kind: TerrainWorkerMessageKind.Tile; request: TerrainTileRequest };
