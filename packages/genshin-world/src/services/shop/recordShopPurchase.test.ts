import type { ShopGood } from "#src/models/shop/ShopGood";

import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";
import { recordShopPurchase } from "#src/services/shop/recordShopPurchase";
import { describe, expect, test } from "vitest";

describe(recordShopPurchase, () => {
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

  test("a good with no buy limit keeps no purchase", () => {
    expect.hasAssertions();
    expect(recordShopPurchase([], { ...GOOD, buyLimit: 0 }, NOW)).toStrictEqual([]);
  });

  test("a good bought before its refresh starts its count again at one", () => {
    expect.hasAssertions();
    const refreshTime = computeShopRefreshTime(ShopRefresh.Daily, NOW);
    const purchases = [{ count: 2, goodsId: GOOD.goodsId, lastPurchasedAt: refreshTime.subtract({ seconds: 1 }) }];
    expect(recordShopPurchase(purchases, GOOD, NOW)).toStrictEqual([
      { count: 1, goodsId: GOOD.goodsId, lastPurchasedAt: NOW },
    ]);
  });
});
