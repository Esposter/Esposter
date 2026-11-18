import type { GroundPieceSquare } from "#src/models/world/GroundPieceSquare";

// The square a joined group is fitted over: the bounding box of its squares, centred on the box and as wide as its longer
// Side
export const getJoinedGroundSquare = (squares: readonly GroundPieceSquare[]): GroundPieceSquare => {
  const minX = Math.min(...squares.map(({ centre, half }) => centre.x - half));
  const maxX = Math.max(...squares.map(({ centre, half }) => centre.x + half));
  const minZ = Math.min(...squares.map(({ centre, half }) => centre.z - half));
  const maxZ = Math.max(...squares.map(({ centre, half }) => centre.z + half));
  return { centre: { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 }, half: Math.max(maxX - minX, maxZ - minZ) / 2 };
};
