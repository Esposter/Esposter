import type { OutlineWidthKnots } from "#src/models/nodes/OutlineWidthKnots";
import type { Vector4Tuple } from "three";

// A material's own outline: its colour with its alpha, its width as a multiple of the scene's, and the knots its width
// Scales along the view depth
export interface ToonEdge {
  color: Vector4Tuple;
  size: number;
  widthKnots: OutlineWidthKnots;
}
