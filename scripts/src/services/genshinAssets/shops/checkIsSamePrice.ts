import type { PaimonsBargainsPrice } from "#src/models/genshinAssets/shops/PaimonsBargainsPrice";

export const checkIsSamePrice = (first: PaimonsBargainsPrice, second: PaimonsBargainsPrice): boolean =>
  first.buyLimit === second.buyLimit &&
  first.costs.length === second.costs.length &&
  first.costs.every(
    ({ count, itemId }, index) => count === second.costs[index]?.count && itemId === second.costs[index]?.itemId,
  ) &&
  first.refresh === second.refresh;
