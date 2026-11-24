import type { GroundPieceSquare } from "#src/models/world/GroundPieceSquare";
import type { GroundPoint, TerrainBounds } from "genshin-engine";

import { getGroundPieceQuarter } from "#src/services/world/getGroundPieceQuarter";
import { getGroundPieceSquare } from "#src/services/world/getGroundPieceSquare";
import { getJoinedGroundSquare } from "#src/services/world/getJoinedGroundSquare";

// The squares a split or joined piece is clipped to, read one level at a time from its area's square: each level's
// Indices name quarters of the square the levels above it name, and a level that joins several names the square over
// Them, which the next level splits as the fit does. On the last level a group covers the union of its quarters'
// Squares
export const getLaidGroundSquares = (
  outline: readonly GroundPoint[],
  path: readonly (readonly number[])[],
): TerrainBounds[] => {
  const square = path
    .slice(0, -1)
    .reduce<GroundPieceSquare>(
      (parent, indices) => getJoinedGroundSquare(indices.map((index) => getGroundPieceQuarter(parent, index))),
      getGroundPieceSquare(outline),
    );
  return (path.at(-1) ?? []).map((index) => {
    const { centre, half } = getGroundPieceQuarter(square, index);
    return { maxX: centre.x + half, maxZ: centre.z + half, minX: centre.x - half, minZ: centre.z - half };
  });
};
