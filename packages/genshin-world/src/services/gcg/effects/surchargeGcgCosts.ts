import type { GcgCost } from "#src/models/gcg/GcgCost";

import { GcgCostKind } from "#src/models/gcg/GcgCostKind";

// The costs with a surcharge's dice added to the line of Unaligned dice a switch pays, the one line a switch has
export const surchargeGcgCosts = (costs: GcgCost[], count: number): GcgCost[] =>
  costs.map((cost) => (cost.kind === GcgCostKind.Unaligned ? { ...cost, count: cost.count + count } : cost));
