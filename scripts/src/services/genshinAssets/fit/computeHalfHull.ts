import type { OutlinePoint } from "#src/models/genshinAssets/fit/OutlinePoint";

import { computeCrossProduct } from "#src/services/genshinAssets/fit/computeCrossProduct";

// One chain of the monotone chain: the points, in order, that keep every turn the same way
export const computeHalfHull = (ordered: readonly OutlinePoint[]): OutlinePoint[] => {
  const chain: OutlinePoint[] = [];
  for (const point of ordered) {
    while (chain.length >= 2 && computeCrossProduct(chain.at(-2) ?? point, chain.at(-1) ?? point, point) <= 0)
      chain.pop();
    chain.push(point);
  }
  return chain;
};
