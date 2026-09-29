import type { TerrainTileOptions } from "genshin-engine";

export type TerrainTileRequest = Pick<TerrainTileOptions, "cellsPerSide" | "finestTileSize" | "key">;
