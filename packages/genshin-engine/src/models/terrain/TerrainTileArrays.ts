import type { TerrainTile } from "#src/models/terrain/TerrainTile";

// A tile's arrays without its key, which is what a ring's merged arrays are: one tile's or a ring's, drawn the same way
export type TerrainTileArrays = Pick<
  TerrainTile,
  "coarseColors" | "coarseNormals" | "coarsePositions" | "colors" | "normals" | "positions"
>;
