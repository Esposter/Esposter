import type { ForgeResult } from "#src/models/forging/ForgeResult";

import { takeOne } from "@esposter/shared";

// The result a unit yields, drawn from a roll in [0, 1) by the weight each of the recipe's results holds. A recipe with one
// Result always yields it
export const drawForgeResult = (results: ForgeResult[], roll: number): ForgeResult => {
  const pick = roll * results.reduce((sum, { weight }) => sum + weight, 0);
  let weightBefore = 0;
  const index = results.findIndex(({ weight }) => {
    weightBefore += weight;
    return pick < weightBefore;
  });
  return takeOne(results, index === -1 ? results.length - 1 : index);
};
