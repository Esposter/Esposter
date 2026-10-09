import type { GcgCost } from "#src/models/gcg/GcgCost";

import { GcgCostKind } from "#src/models/gcg/GcgCostKind";

// The dice a cost takes, the energy it takes left out: the number a card or skill shows as its cost in the corner
export const countGcgDiceCost = (costs: GcgCost[]): number =>
  costs.reduce((count, cost) => (cost.kind === GcgCostKind.Energy ? count : count + cost.count), 0);
