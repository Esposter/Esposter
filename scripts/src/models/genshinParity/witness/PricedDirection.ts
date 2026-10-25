import type { Vector } from "#src/models/shared/Vector";

// A sun direction priced: its edges' distance from the reference's and how many edge pixels ours draws
export interface PricedDirection {
  direction: Vector;
  distance: number;
  ourEdgeCount: number;
}
