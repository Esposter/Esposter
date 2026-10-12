import type { Vector3Tuple } from "three";

// The outline's width knots: three view depths, and the width scale at each, which the outline interpolates between
export interface OutlineWidthKnots {
  depths: Vector3Tuple;
  scales: Vector3Tuple;
}
