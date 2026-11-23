import type { PricedDirection } from "#src/models/genshinParity/witness/PricedDirection";
import type { Vector } from "#src/models/shared/Vector";

// What a reference's shadow solve reports: the scene's own direction priced, the grid's best and the probes beside it,
// And the solved direction when one was searched for
export interface ShadowSolve {
  direction: Vector;
  distance: number;
  edgeCount: number;
  grid: PricedDirection[];
  imagePath: string;
  ourEdgeCount: number;
  probes: PricedDirection[];
  solved?: PricedDirection;
}
