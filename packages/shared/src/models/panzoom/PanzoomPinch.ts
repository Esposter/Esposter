import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";

// Two pointers that scale: the scale and finger distance the pinch started at, and the midpoint its last step ended on
export interface PanzoomPinch {
  midpoint: PanzoomPoint;
  startDistance: number;
  startScale: number;
}
