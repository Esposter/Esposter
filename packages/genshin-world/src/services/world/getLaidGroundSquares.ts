import type { GroundPoint, TerrainBounds } from "genshin-engine";

import { getGroundPieceSquare } from "#src/services/world/getGroundPieceSquare";

// The squares a split or joined piece is clipped to: its area's square split into four quarters, each named by its index
// The fit splits them in, odd indices east of the centre and those from two north of it. A joined piece is named by its
// Quarters' indices joined with a dash, and covers the union of their squares
export const getLaidGroundSquares = (outline: readonly GroundPoint[], indices: string): TerrainBounds[] => {
  const { centre, half } = getGroundPieceSquare(outline);
  return indices.split("-").map((index) => {
    const quarter = Number(index);
    const isEast = quarter % 2 === 1;
    const isNorth = quarter >= 2;
    return {
      maxX: isEast ? centre.x + half : centre.x,
      maxZ: isNorth ? centre.z + half : centre.z,
      minX: isEast ? centre.x : centre.x - half,
      minZ: isNorth ? centre.z : centre.z - half,
    };
  });
};
