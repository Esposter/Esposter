import type { Vector } from "#src/models/shared/Vector";

// A point of a piece's skeleton: a cross-section's centre and radius, or its start or its tip, and the point it grows
// From, none for its start
export interface SkeletonNode {
  centre: Vector;
  // The vertices standing past the cross-section, the far end of each edge it cuts, which its piece's tip is found from
  farVertices: number[];
  level: number;
  parent?: number;
  radius: number;
}
