import type { ShopGood } from "#src/models/shop/ShopGood";

import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { discountShopGood } from "#src/services/shop/discountShopGood";
import { describe, expect, test } from "vitest";

describe(discountShopGood, () => {
  const DISCOUNT_LEVEL = 4;
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const moraGood: ShopGood = {
    beginTime: EPOCH.toString(),
    buyLimit: 100,
    endTime: EPOCH.add({ hours: 24 * 365 }).toString(),
    goodsId: 201_002,
    itemCount: 1,
    itemId: 105_001,
    minPlayerLevel: 1,
    priceCount: 120,
    priceItemId: MORA_ITEM_ID,
    refresh: ShopRefresh.Daily,
    reputationDiscountLevel: DISCOUNT_LEVEL,
  };

  test("a discount applies at its named shop", () => {
    expect.hasAssertions();
    expect(discountShopGood(moraGood, DISCOUNT_LEVEL).priceCount).toBe(105);
    // The wiki's Blanche prices: Salt at 60 is 50 after the discount, Pepper at 80 is 70
    expect(discountShopGood({ ...moraGood, priceCount: 60 }, DISCOUNT_LEVEL).priceCount).toBe(50);
    expect(discountShopGood({ ...moraGood, priceCount: 80 }, DISCOUNT_LEVEL).priceCount).toBe(70);
  });

  test("a good below the discount's reputation level keeps its price", () => {
    expect.hasAssertions();
    expect(discountShopGood(moraGood, DISCOUNT_LEVEL - 1).priceCount).toBe(120);
  });

  test("a discount does not apply at an unnamed shop", () => {
    expect.hasAssertions();
    const { reputationDiscountLevel: _, ...undiscountedGood } = moraGood;
    expect(discountShopGood(undiscountedGood, DISCOUNT_LEVEL).priceCount).toBe(120);
  });

  test("a good priced in items keeps its price", () => {
    expect.hasAssertions();
    const itemGood: ShopGood = { ...moraGood, priceCount: 5, priceItemId: 221 };
    expect(discountShopGood(itemGood, DISCOUNT_LEVEL).priceCount).toBe(5);
  });
});
