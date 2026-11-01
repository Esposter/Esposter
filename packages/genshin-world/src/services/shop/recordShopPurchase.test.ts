import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";
import { DAILY_LIMITED_GOOD, DAILY_NOW } from "#src/services/shop/constants.test";
import { recordShopPurchase } from "#src/services/shop/recordShopPurchase";
import { describe, expect, test } from "vitest";

describe(recordShopPurchase, () => {
  test("a good with no buy limit keeps no purchase", () => {
    expect.hasAssertions();
    expect(recordShopPurchase([], { ...DAILY_LIMITED_GOOD, buyLimit: 0 }, DAILY_NOW)).toStrictEqual([]);
  });

  test("a good bought before its refresh starts its count again at one", () => {
    expect.hasAssertions();
    const refreshTime = computeShopRefreshTime(ShopRefresh.Daily, DAILY_NOW);
    const purchases = [
      { count: 2, goodsId: DAILY_LIMITED_GOOD.goodsId, lastPurchasedAt: refreshTime.subtract({ seconds: 1 }) },
    ];
    expect(recordShopPurchase(purchases, DAILY_LIMITED_GOOD, DAILY_NOW)).toStrictEqual([
      { count: 1, goodsId: DAILY_LIMITED_GOOD.goodsId, lastPurchasedAt: DAILY_NOW },
    ]);
  });
});
