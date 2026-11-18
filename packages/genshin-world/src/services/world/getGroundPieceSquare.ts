import type { GroundPoint } from "genshin-engine";

import { getTerrainPieceBounds } from "#src/services/world/getTerrainPieceBounds";

// The square a piece of an area is fitted over: its outline's bounding box round the box's centre, as wide as the box's
// Longer side
export const getGroundPieceSquare = (outline: readonly GroundPoint[]): { centre: GroundPoint; half: number } => {
  const { maxX, maxZ, minX, minZ } = getTerrainPieceBounds({ outline }, 0);
  return { centre: { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 }, half: Math.max(maxX - minX, maxZ - minZ) / 2 };
};
