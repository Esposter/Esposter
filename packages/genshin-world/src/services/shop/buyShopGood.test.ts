import type { ShopGood } from "#src/models/shop/ShopGood";

import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { buyShopGood } from "#src/services/shop/buyShopGood";
import { describe, expect, test } from "vitest";

describe(buyShopGood, () => {
  const ADVENTURE_RANK = 4;
  const STARGLITTER_PRICE = 5;
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // Forty days past the epoch, a morning in February, after the month's refresh on its first
  const NOW = EPOCH.add({ hours: 24 * 40 });
  const fateGood: ShopGood = {
    beginTime: EPOCH.toString(),
    buyLimit: 0,
    endTime: EPOCH.add({ hours: 24 * 365 }).toString(),
    goodsId: 102_003,
    itemCount: 1,
    itemId: 223,
    minPlayerLevel: ADVENTURE_RANK,
    priceCount: STARGLITTER_PRICE,
    priceItemId: 221,
  };
  const limitedGood: ShopGood = { ...fateGood, buyLimit: 1 };

  test("should take the price and give the item's currency, recording the purchase at its moment", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: STARGLITTER_PRICE * 2 };
    const result = buyShopGood(wallet, [], fateGood, ADVENTURE_RANK, NOW);

    expect(result?.wallet[Currency.MasterlessStarglitter]).toBe(STARGLITTER_PRICE);
    expect(result?.wallet[Currency.IntertwinedFate]).toBe(1);
    expect(result?.purchases).toStrictEqual([{ goodsId: fateGood.goodsId, purchasedAt: NOW }]);
  });

  test("should refuse a good the wallet cannot pay for", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: STARGLITTER_PRICE - 1 };

    expect(buyShopGood(wallet, [], fateGood, ADVENTURE_RANK, NOW)).toBeUndefined();
  });

  test("should refuse a good below the Adventure Rank it shows from", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: STARGLITTER_PRICE };

    expect(buyShopGood(wallet, [], fateGood, ADVENTURE_RANK - 1, NOW)).toBeUndefined();
  });

  test("should refuse a limited good bought up this month, and offer it again after a purchase made before the refresh", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: STARGLITTER_PRICE * 2 };
    const boughtThisMonth = [{ goodsId: limitedGood.goodsId, purchasedAt: NOW.subtract({ hours: 24 }) }];
    const boughtLastMonth = [{ goodsId: limitedGood.goodsId, purchasedAt: NOW.subtract({ hours: 24 * 10 }) }];

    expect(buyShopGood(wallet, boughtThisMonth, limitedGood, ADVENTURE_RANK, NOW)).toBeUndefined();
    expect(buyShopGood(wallet, boughtLastMonth, limitedGood, ADVENTURE_RANK, NOW)).toBeDefined();
  });
});
