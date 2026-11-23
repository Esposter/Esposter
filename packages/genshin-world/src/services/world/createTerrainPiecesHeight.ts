import type { TerrainPieceDomain } from "#src/models/world/TerrainPieceDomain";

import { getTerrainPieceBounds } from "#src/services/world/getTerrainPieceBounds";
import { getTerrainPieceSignedDistance } from "#src/services/world/getTerrainPieceSignedDistance";
import { fileByCell } from "genshin-engine/terrainWorker";

// A piece's share of the ground at a signed distance from its outline, given the share its neighbours take there. The
// Share Is smoothstepped from none a blend's width outside the outline to all of it at the outline, when no neighbour's
// Band Reaches the point, so an outer edge holds the piece's own surface to its outline and blends outward. Where the
// Neighbours Take their full share, it is all of it only a blend's width inside, so a seam's band is centred on the
// Seam. Between, the Ramp widens continuously with the neighbours' share, so the height has no step where a neighbour's
// Band begins
const getTerrainBlendShare = (signedDistance: number, blendWidth: number, neighbourShare: number): number => {
  const t = Math.min(Math.max((signedDistance + blendWidth) / (blendWidth * (1 + neighbourShare)), 0), 1);
  return t * t * (3 - 2 * t);
};

// The share a piece takes across a seam whose other side is full: the centred band, all of it a blend's width inside
// And None a blend's width outside. Each piece's share here is what its neighbours take from the point
const getTerrainSeamShare = (signedDistance: number, blendWidth: number): number =>
  getTerrainBlendShare(signedDistance, blendWidth, 1);

// A piece of a region's ground: its domain and the surface it is over that domain, its own alone
export interface TerrainPiece {
  domain: TerrainPieceDomain;
  getHeight: (x: number, z: number) => number;
}

// The height of a region's pieces laid over a base. Inside a piece's domain the ground is that piece's surface alone,
// And Where no piece stands it is the base's. A piece's share is set by `getTerrainBlendShare`: an outer edge no other
// Piece Reaches holds the piece's own surface to its outline and blends outward into the base, while a seam's band is
// Centred on The seam and mixes each piece's surface in. The base takes what the shares leave, so the ground is
// Continuous wherever an Outline falls. The pieces are filed in the cells their bands reach, so a point reads only the
// Few near it
export const createTerrainPiecesHeight = (
  getBaseHeight: (x: number, z: number) => number,
  pieces: readonly TerrainPiece[],
  blendWidth: number,
): ((x: number, z: number) => number) => {
  const getPieces = fileByCell(pieces, ({ domain }) => getTerrainPieceBounds(domain, blendWidth));
  return (x, z) => {
    // Each piece's distance is read once here, and the seam shares are totalled first
    // Then each piece's own is removed from the total, leaving its neighbours' shares
    const reads = getPieces(x, z).map((piece) => {
      const signedDistance = getTerrainPieceSignedDistance(piece.domain, x, z);
      return { piece, seamShare: getTerrainSeamShare(signedDistance, blendWidth), signedDistance };
    });
    let seamShareTotal = 0;
    for (const { seamShare } of reads) seamShareTotal += seamShare;
    let share = 0;
    let weighted = 0;
    for (const { piece, seamShare, signedDistance } of reads) {
      const neighbourShare = Math.min(Math.max(seamShareTotal - seamShare, 0), 1);
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
