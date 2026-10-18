import type { GroundPoint } from "genshin-engine";

// An area of a region the catalogue outlines, whose ground is fitted as one piece of the region's ground
export interface GroundPieceArea {
  id: string;
  outline: GroundPoint[];
}
