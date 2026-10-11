import type { TerrainBounds } from "#src/models/terrain/TerrainBounds";

// The rectangle a segment's influence stays inside, grown by its reach on every side
export const getSegmentBounds = (
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
  reach: number,
): TerrainBounds => ({
  maxX: Math.max(startX, endX) + reach,
  maxZ: Math.max(startZ, endZ) + reach,
  minX: Math.min(startX, endX) - reach,
  minZ: Math.min(startZ, endZ) - reach,
});
