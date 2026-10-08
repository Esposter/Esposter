import type { GroundPoint } from "genshin-engine";

// A similarity carrying the map's coordinates into the game's: its points first mirrored across the x axis if the
// Map's down runs the other way, then turned, scaled and offset
export interface SimilarityTransform {
  mirrored: boolean;
  offset: GroundPoint;
  scale: number;
  turn: number;
}
