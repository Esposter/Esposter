import type { OutlineWidthKnots } from "#src/models/nodes/OutlineWidthKnots";
import type { Vector4Tuple } from "three";

// A material's own outline: its colour with its alpha, its width as a multiple of the scene's, and the knots its width
// Scales along the view depth. A game model's outline also reads its vertex colour: the alpha scales its width, so a
// Vertex with none is not pushed out at all
export interface ToonEdge {
  color: Vector4Tuple;
  // Whether the vertex colour's alpha scales the width, so a vertex with no alpha is not pushed out at all
  isVertexWeighted?: boolean;
  // The offset along the view-space normal, its size as a multiple of the scene's, and whether the vertex colour's blue
  // Scales it, from its middle
  offset?: { isBlueScaled: boolean; size: number };
  size: number;
  widthKnots: OutlineWidthKnots;
}
