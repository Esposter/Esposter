import type { TerrainBounds } from "#src/models/terrain/TerrainBounds";

// Whether two rectangles share any point, their edges included
export const checkTerrainBoundsOverlap = (first: TerrainBounds, second: TerrainBounds): boolean =>
  first.minX <= second.maxX && second.minX <= first.maxX && first.minZ <= second.maxZ && second.minZ <= first.maxZ;
