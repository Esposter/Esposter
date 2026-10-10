import type { Vector } from "#src/models/shared/Vector";

// A point read off a mesh's surface, and the unit normal of the face it lies on
export interface MeshSample {
  normal: Vector;
  point: Vector;
}
