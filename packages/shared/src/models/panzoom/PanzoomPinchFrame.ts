import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";

// The distance between two pointers and the point halfway between them, which a pinch scales by and zooms about
export interface PanzoomPinchFrame {
  distance: number;
  midpoint: PanzoomPoint;
}
