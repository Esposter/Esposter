import type { GroundPiece } from "#src/models/genshinAssets/fit/GroundPiece";

// Pieces joined into one, as a square over all of their bounding boxes, centred on the box and as wide as the box's
// Longer side. Its samples are those of any piece it joins, so the joined piece is fitted and gated as one piece
export const joinGroundPieces = (pieces: GroundPiece[], key: string): GroundPiece => {
  const minX = Math.min(...pieces.map(({ centre, half }) => centre.x - half));
  const maxX = Math.max(...pieces.map(({ centre, half }) => centre.x + half));
  const minZ = Math.min(...pieces.map(({ centre, half }) => centre.z - half));
  const maxZ = Math.max(...pieces.map(({ centre, half }) => centre.z + half));
  return {
    centre: { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 },
    checkIsInside: (x, z) => pieces.some((piece) => piece.checkIsInside(x, z)),
    half: Math.max(maxX - minX, maxZ - minZ) / 2,
    key,
  };
};
