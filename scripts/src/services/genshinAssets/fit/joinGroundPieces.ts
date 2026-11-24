import type { GroundPiece } from "#src/models/genshinAssets/fit/GroundPiece";

import { getJoinedGroundSquare } from "genshin-world/definitions";

// Pieces joined into one, as a square over all of their bounding boxes, centred on the box and as wide as the box's
// Longer side. Its samples are those of any piece it joins, so the joined piece is fitted and gated as one piece
export const joinGroundPieces = (pieces: GroundPiece[], key: string): GroundPiece => {
  const { centre, half } = getJoinedGroundSquare(pieces);
  return { centre, checkIsInside: (x, z) => pieces.some((piece) => piece.checkIsInside(x, z)), half, key };
};
