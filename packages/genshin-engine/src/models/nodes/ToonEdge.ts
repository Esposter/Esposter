import type { Vector4Tuple } from "three";

// A material's own outline: its colour with its alpha, and its width as a multiple of the scene's
export interface ToonEdge {
  color: Vector4Tuple;
  size: number;
}
