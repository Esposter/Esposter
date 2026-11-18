import type { TerrainPieceDomain } from "#src/models/world/TerrainPieceDomain";

import { getTerrainPieceBounds } from "#src/services/world/getTerrainPieceBounds";
import { computeOutlineSignedDistance, fileByCell } from "genshin-engine/terrainWorker";

// A piece's share of the ground at a signed distance from its outline: all of it a blend's width inside, none a blend's
// Width outside, and a smoothstep across the band between, so the share and its slope are continuous across the seam
const getTerrainBlendShare = (signedDistance: number, blendWidth: number): number => {
  const t = Math.min(Math.max((signedDistance + blendWidth) / (2 * blendWidth), 0), 1);
  return t * t * (3 - 2 * t);
};

// How far inside a piece's domain a point stands, positive inside and negative outside. The outline's distance is clipped
// To each square: a square's distance is the nearest of its four sides, and a point in any one of the squares is inside
const getTerrainPieceSignedDistance = ({ outline, squares }: TerrainPieceDomain, x: number, z: number): number => {
  const outlineDistance = computeOutlineSignedDistance(outline, x, z);
  if (!squares) return outlineDistance;
  let distance = -Infinity;
  for (const { maxX, maxZ, minX, minZ } of squares)
    distance = Math.max(distance, Math.min(outlineDistance, x - minX, maxX - x, z - minZ, maxZ - z));
  return distance;
};

// A piece of a region's ground: its domain and the surface it is over that domain, its own alone
export interface TerrainPiece {
  domain: TerrainPieceDomain;
  getHeight: (x: number, z: number) => number;
}

// The height of a region's pieces laid over a base. Inside a piece's domain the ground is that piece's surface alone, and
// Where no piece stands it is the base's. Across an outline's seam, a band of `blendWidth` metres either side of it mixes
// Each piece's surface in by a share that is all of it a band's width inside and none outside, and the base takes what the
// Shares leave, so the ground is continuous wherever an outline falls. The pieces are filed in the cells their bands reach,
// So a point reads only the few near it
export const createTerrainPiecesHeight = (
  getBaseHeight: (x: number, z: number) => number,
  pieces: readonly TerrainPiece[],
  blendWidth: number,
): ((x: number, z: number) => number) => {
  const getPieces = fileByCell(pieces, ({ domain }) => getTerrainPieceBounds(domain, blendWidth));
  return (x, z) => {
    let share = 0;
    let weighted = 0;
    for (const piece of getPieces(x, z)) {
      const pieceShare = getTerrainBlendShare(getTerrainPieceSignedDistance(piece.domain, x, z), blendWidth);
      if (pieceShare === 0) continue;
      share += pieceShare;
      weighted += pieceShare * piece.getHeight(x, z);
    }
    if (share === 0) return getBaseHeight(x, z);
    if (share >= 1) return weighted / share;
    return weighted + (1 - share) * getBaseHeight(x, z);
  };
};
