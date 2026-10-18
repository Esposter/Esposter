import type { ShopGood } from "#src/models/shop/ShopGood";

import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";

// Whether every cost of a good is a currency the wallet trades in, so the good is bought from the wallet alone, as Paimon's
// Bargains sells its characters and weapons
export const checkIsCurrencyOnlyGood = (good: Pick<ShopGood, "costs">): boolean =>
  good.costs.every(({ itemId }) => ShopItemCurrencyMap[itemId] !== undefined);
