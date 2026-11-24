import type { TerrainPieceDomain } from "#src/models/world/TerrainPieceDomain";

import { computeOutlineSignedDistance } from "genshin-engine/terrainWorker";

// How far inside a piece's domain a point stands, positive inside and negative outside. The outline's distance is
// Clipped to each square: a square's distance is the nearest of its four sides, and a point in any one of the squares
// Is inside
export const getTerrainPieceSignedDistance = (
  { outline, squares }: TerrainPieceDomain,
  x: number,
  z: number,
): number => {
  const outlineDistance = computeOutlineSignedDistance(outline, x, z);
  if (!squares) return outlineDistance;
  let distance = -Infinity;
  for (const { maxX, maxZ, minX, minZ } of squares)
    distance = Math.max(distance, Math.min(outlineDistance, x - minX, maxX - x, z - minZ, maxZ - z));
  return distance;
};
