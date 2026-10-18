import type { ShopGood } from "#src/models/shop/ShopGood";

import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { computeShopGoodLeft } from "#src/services/shop/computeShopGoodLeft";
import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";
import { describe, expect, test } from "vitest";

describe(computeShopGoodLeft, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const NOW = EPOCH.add({ hours: 300 });
  const GOOD: ShopGood = {
    beginTime: EPOCH.toString(),
    buyLimit: 3,
    endTime: EPOCH.add({ hours: 876_000 }).toString(),
    goodsId: 7,
    itemCount: 1,
    itemId: 1,
    minPlayerLevel: 1,
    priceCount: 2,
    priceItemId: 202,
    refresh: ShopRefresh.Daily,
  };

  test("a good with no buy limit has no count left", () => {
    expect.hasAssertions();
    expect(computeShopGoodLeft({ ...GOOD, buyLimit: 0 }, [], NOW)).toBeUndefined();
  });

  test("only the purchases made since the refresh count against the limit", () => {
    expect.hasAssertions();
    const refreshTime = computeShopRefreshTime(ShopRefresh.Daily, NOW);
    expect(computeShopGoodLeft(GOOD, [{ count: 2, goodsId: 7, lastPurchasedAt: refreshTime }], NOW)).toBe(1);
    expect(
      computeShopGoodLeft(GOOD, [{ count: 2, goodsId: 7, lastPurchasedAt: refreshTime.subtract({ seconds: 1 }) }], NOW),
    ).toBe(3);
  });

  test("the purchases of another good do not count against the limit", () => {
    expect.hasAssertions();
    const refreshTime = computeShopRefreshTime(ShopRefresh.Daily, NOW);
    expect(computeShopGoodLeft(GOOD, [{ count: 2, goodsId: 8, lastPurchasedAt: refreshTime }], NOW)).toBe(3);
  });

  test("a good bought up to its limit has none left", () => {
    expect.hasAssertions();
    const refreshTime = computeShopRefreshTime(ShopRefresh.Daily, NOW);
    const purchases = [{ count: GOOD.buyLimit, goodsId: 7, lastPurchasedAt: refreshTime.add({ seconds: 1 }) }];
    expect(computeShopGoodLeft(GOOD, purchases, NOW)).toBe(0);
  });
});
