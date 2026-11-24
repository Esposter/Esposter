import type { GroundPiece } from "#src/models/genshinAssets/fit/GroundPiece";

import { getGroundPieceKey, getGroundPieceQuarter } from "genshin-world/definitions";

// A piece's four quarters, each a piece of its own over its quarter of the square: half the side, and its samples those
// Of its quarter inside the piece's own. A sample on a shared edge belongs to the quarter east or north of it, so no
// Sample lies in two of them
export const splitGroundPiece = ({ centre, checkIsInside, half, key }: GroundPiece): GroundPiece[] =>
  [0, 1, 2, 3].map((quarter) => {
    const square = getGroundPieceQuarter({ centre, half }, quarter);
    const sideX = quarter % 2 === 0 ? -1 : 1;
    const sideZ = quarter < 2 ? -1 : 1;
    return {
      centre: square.centre,
      checkIsInside: (x, z) =>
        checkIsInside(x, z) && (sideX < 0 ? x < centre.x : x >= centre.x) && (sideZ < 0 ? z < centre.z : z >= centre.z),
      half: square.half,
      key: getGroundPieceKey(key, [quarter]),
    };
  });
