import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { computeShopGoodLeft } from "#src/services/shop/computeShopGoodLeft";
import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";
import { DAILY_LIMITED_GOOD, DAILY_NOW } from "#src/services/shop/constants.test";
import { describe, expect, test } from "vitest";

describe(computeShopGoodLeft, () => {
  const refreshTime = computeShopRefreshTime(ShopRefresh.Daily, DAILY_NOW);

  test("a good with no buy limit has no count left", () => {
    expect.hasAssertions();
    expect(computeShopGoodLeft({ ...DAILY_LIMITED_GOOD, buyLimit: 0 }, [], DAILY_NOW)).toBeUndefined();
  });

  test("only the purchases made since the refresh count against the limit", () => {
    expect.hasAssertions();
    expect(
      computeShopGoodLeft(DAILY_LIMITED_GOOD, [{ count: 2, goodsId: 7, lastPurchasedAt: refreshTime }], DAILY_NOW),
    ).toBe(1);
    expect(
      computeShopGoodLeft(
        DAILY_LIMITED_GOOD,
        [{ count: 2, goodsId: 7, lastPurchasedAt: refreshTime.subtract({ seconds: 1 }) }],
        DAILY_NOW,
      ),
    ).toBe(3);
  });

  test("the purchases of another good do not count against the limit", () => {
    expect.hasAssertions();
    expect(
      computeShopGoodLeft(DAILY_LIMITED_GOOD, [{ count: 2, goodsId: 8, lastPurchasedAt: refreshTime }], DAILY_NOW),
    ).toBe(3);
  });

  test("a good bought up to its limit has none left", () => {
    expect.hasAssertions();
    const purchases = [
      { count: DAILY_LIMITED_GOOD.buyLimit, goodsId: 7, lastPurchasedAt: refreshTime.add({ seconds: 1 }) },
    ];
    expect(computeShopGoodLeft(DAILY_LIMITED_GOOD, purchases, DAILY_NOW)).toBe(0);
  });
});
