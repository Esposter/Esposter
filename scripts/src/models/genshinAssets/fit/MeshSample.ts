import type { Vector } from "#src/models/shared/Vector";

// A point read off a mesh's surface, and the unit normal of the face it lies on, with that face's index among the faces
// Read and the point's weight on each of the face's corners, in their order, so anything the corners carry (their
// Texture coordinates) is read at the point too
export interface MeshSample {
  face: number;
  normal: Vector;
  point: Vector;
  weights: Vector;
}
