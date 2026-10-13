import type { OutlineWidthKnots } from "#src/models/nodes/OutlineWidthKnots";
import type { Vector4Tuple } from "three";
import type { Node } from "three/webgpu";

// A material's own outline: its colour with its alpha, its width as a multiple of the scene's, and the knots its width
// Scales along the view depth. A game model's outline also reads its vertex colour: the alpha scales its width, so a
// Vertex with none is not pushed out at all
export interface ToonEdge {
  // One colour for every pixel, which outlines of the same colour share, or a game model's colour read per pixel
  color: Node<"vec4"> | Vector4Tuple;
  // Whether the vertex colour's alpha scales the width, so a vertex with no alpha is not pushed out at all
  isVertexWeighted?: boolean;
  // The game's offset along the view ray, its size and the block-B flag that decides whether the vertex's blue scales it
  offset?: { blockBChannel: number; size: number };
  size: number;
  widthKnots: OutlineWidthKnots;
}
