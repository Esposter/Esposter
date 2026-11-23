import type { GroundPoint, TerrainBounds } from "genshin-engine";

// The ground a piece of a region is the surface of: the area its outline draws, clipped to the squares its quarters
// Cover When it is a split or joined piece. Without squares the piece is the whole outline
export interface TerrainPieceDomain {
  outline: readonly GroundPoint[];
  squares?: readonly TerrainBounds[] | undefined;
}
