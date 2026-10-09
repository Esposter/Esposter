import type { Element } from "#src/models/Element";
import type { GcgCost } from "#src/models/gcg/GcgCost";
import type { GcgCostReduction } from "#src/models/gcg/GcgCostReduction";

import { GcgCostKind } from "#src/models/gcg/GcgCostKind";

// The costs with a reduction taken off the first lines its element matches, a line's count going to none when the
// Reduction covers it. A reduction without an element matches any die a cost asks for, and a Matching line matches the
// Element of the character paying
export const reduceGcgCosts = (costs: GcgCost[], reduction: GcgCostReduction, matchingElement: Element): GcgCost[] => {
  let remainingCount = reduction.count;
  return costs
    .map((cost) => {
      if (
        remainingCount === 0 ||
        cost.kind === GcgCostKind.Energy ||
        !checkIsGcgCostMatched(cost, reduction, matchingElement)
      )
        return cost;
      const reducedCount = Math.min(cost.count, remainingCount);
      remainingCount -= reducedCount;
      return { ...cost, count: cost.count - reducedCount };
    })
    .filter((cost) => cost.count > 0);
};

const checkIsGcgCostMatched = (cost: GcgCost, reduction: GcgCostReduction, matchingElement: Element): boolean => {
  if (reduction.kind !== undefined && cost.kind !== reduction.kind) return false;
  if (reduction.element === undefined) return true;
  if (cost.kind === GcgCostKind.Dice) return cost.element === reduction.element;
  return cost.kind === GcgCostKind.Matching && matchingElement === reduction.element;
};
