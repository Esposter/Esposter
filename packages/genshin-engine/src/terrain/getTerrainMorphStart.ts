import type { TerrainOptions } from "#src/models/terrain/TerrainOptions";

// How far from the eye the finest level's vertices start morphing onto the next level's grid, in metres; each level's
// Is twice the level below's, as its range is. A tile splits into its children once its bounds come within the level
// Below's range, half its own, and its farthest vertex then stands no more than a tile's diagonal beyond them, so a
// Morph starting past that leaves a splitting tile wholly at its own level, which its children, fully morphed onto its
// Grid there, draw unchanged
export const getTerrainMorphStart = ({
  finestRange,
  finestTileSize,
}: Pick<TerrainOptions, "finestRange" | "finestTileSize">): number => finestRange / 2 + Math.SQRT2 * finestTileSize;
