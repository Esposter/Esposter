import type { GroundPiece } from "#src/models/genshinAssets/fit/GroundPiece";

import { getGroundPieceKey, getGroundPieceQuarter } from "genshin-world";

// A piece's four quarters, each a piece of its own over its quarter of the square: half the side, and its samples those of
// Its quarter inside the piece's own. A sample on a shared edge belongs to the quarter east or north of it, so no sample
// Lies in two of them
export const splitGroundPiece = ({ centre, checkIsInside, half, key }: GroundPiece): GroundPiece[] =>
  [0, 1, 2, 3].map((quarter) => {
    const square = getGroundPieceQuarter({ centre, half }, quarter);
    const sideX = square.centre.x < centre.x ? -1 : 1;
    const sideZ = square.centre.z < centre.z ? -1 : 1;
    return {
      centre: square.centre,
      checkIsInside: (x, z) =>
        checkIsInside(x, z) && (sideX < 0 ? x < centre.x : x >= centre.x) && (sideZ < 0 ? z < centre.z : z >= centre.z),
      half: square.half,
      key: getGroundPieceKey(key, [quarter]),
    };
  });
