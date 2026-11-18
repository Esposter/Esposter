import type { TerrainPieceDomain } from "#src/models/world/TerrainPieceDomain";

import { getTerrainPieceBounds } from "#src/services/world/getTerrainPieceBounds";
import { getTerrainPieceSignedDistance } from "#src/services/world/getTerrainPieceSignedDistance";
import { fileByCell } from "genshin-engine/terrainWorker";

// A piece's share of the ground at a signed distance from its outline, given the share its neighbours take there. The share
// Is smoothstepped from none a blend's width outside the outline to all of it at the outline, when no neighbour's band
// Reaches the point, so an outer edge holds the piece's own surface to its outline and blends outward. Where the neighbours
// Take their full share, it is all of it only a blend's width inside, so a seam's band is centred on the seam. Between, the
// Ramp widens continuously with the neighbours' share, so the height has no step where a neighbour's band begins
const getTerrainBlendShare = (signedDistance: number, blendWidth: number, neighbourShare: number): number => {
  const t = Math.min(Math.max((signedDistance + blendWidth) / (blendWidth * (1 + neighbourShare)), 0), 1);
  return t * t * (3 - 2 * t);
};

// The share a piece takes across a seam whose other side is full: the centred band, all of it a blend's width inside and
// None a blend's width outside. Each piece's share here is what its neighbours take from the point
const getTerrainSeamShare = (signedDistance: number, blendWidth: number): number =>
  getTerrainBlendShare(signedDistance, blendWidth, 1);

// A piece of a region's ground: its domain and the surface it is over that domain, its own alone
export interface TerrainPiece {
  domain: TerrainPieceDomain;
  getHeight: (x: number, z: number) => number;
}

// The height of a region's pieces laid over a base. Inside a piece's domain the ground is that piece's surface alone, and
// Where no piece stands it is the base's. A piece's share is set by `getTerrainBlendShare`: an outer edge no other piece
// Reaches holds the piece's own surface to its outline and blends outward into the base, while a seam's band is centred on
// The seam and mixes each piece's surface in. The base takes what the shares leave, so the ground is continuous wherever an
// Outline falls. The pieces are filed in the cells their bands reach, so a point reads only the few near it
export const createTerrainPiecesHeight = (
  getBaseHeight: (x: number, z: number) => number,
  pieces: readonly TerrainPiece[],
  blendWidth: number,
): ((x: number, z: number) => number) => {
  const getPieces = fileByCell(pieces, ({ domain }) => getTerrainPieceBounds(domain, blendWidth));
  return (x, z) => {
    const filed = getPieces(x, z);
    // Each piece's neighbours take the others' seam shares here, so the total is read first and each piece's own removed
    let seamShareTotal = 0;
    for (const piece of filed)
      seamShareTotal += getTerrainSeamShare(getTerrainPieceSignedDistance(piece.domain, x, z), blendWidth);
    let share = 0;
    let weighted = 0;
    for (const piece of filed) {
      const signedDistance = getTerrainPieceSignedDistance(piece.domain, x, z);
      const neighbourShare = Math.min(Math.max(seamShareTotal - getTerrainSeamShare(signedDistance, blendWidth), 0), 1);
      const pieceShare = getTerrainBlendShare(signedDistance, blendWidth, neighbourShare);
      if (pieceShare === 0) continue;
      share += pieceShare;
      weighted += pieceShare * piece.getHeight(x, z);
    }
    if (share === 0) return getBaseHeight(x, z);
    if (share >= 1) return weighted / share;
    return weighted + (1 - share) * getBaseHeight(x, z);
  };
};
