import type { ShopGood } from "#src/models/shop/ShopGood";

import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { discountShopGood } from "#src/services/shop/discountShopGood";
import { describe, expect, test } from "vitest";

const moraCosts = (count: number) => [{ count, itemId: MORA_ITEM_ID }];

describe(discountShopGood, () => {
  const DISCOUNT_LEVEL = 4;
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const ITEM_ID = 221;
  const moraGood: ShopGood = {
    beginTime: EPOCH.toString(),
    buyLimit: 100,
    costs: [{ count: 120, itemId: MORA_ITEM_ID }],
    endTime: EPOCH.add({ hours: 24 * 365 }).toString(),
    goodsId: 201_002,
    itemCount: 1,
    itemId: 105_001,
    minPlayerLevel: 1,
    refresh: ShopRefresh.Daily,
    reputationDiscountLevel: DISCOUNT_LEVEL,
  };

  test("a discount applies at its named shop", () => {
    expect.hasAssertions();
    expect(discountShopGood({ ...moraGood, costs: moraCosts(61) }, DISCOUNT_LEVEL).costs).toStrictEqual(moraCosts(50));
    expect(discountShopGood({ ...moraGood, costs: moraCosts(62) }, DISCOUNT_LEVEL).costs).toStrictEqual(moraCosts(55));
  });

  test("a good at the discount's reputation level pays the discounted Mora", () => {
    expect.hasAssertions();
    expect(discountShopGood(moraGood, DISCOUNT_LEVEL).costs).toStrictEqual(moraCosts(105));
  });

  test("a good below the discount's reputation level keeps its price", () => {
    expect.hasAssertions();
    expect(discountShopGood(moraGood, DISCOUNT_LEVEL - 1).costs).toStrictEqual(moraCosts(120));
  });

  test("a discount does not apply at an unnamed shop", () => {
    expect.hasAssertions();
    const { reputationDiscountLevel: _, ...undiscountedGood } = moraGood;
    expect(discountShopGood(undiscountedGood, DISCOUNT_LEVEL).costs).toStrictEqual(moraCosts(120));
  });

  test("a good priced in items keeps its price", () => {
    expect.hasAssertions();
    const itemGood: ShopGood = { ...moraGood, costs: [{ count: 5, itemId: ITEM_ID }] };
    expect(discountShopGood(itemGood, DISCOUNT_LEVEL).costs).toStrictEqual([{ count: 5, itemId: ITEM_ID }]);
  });

  test("a discount takes only the Mora cost of a good that costs items too", () => {
    expect.hasAssertions();
    const mixedGood: ShopGood = { ...moraGood, costs: [...moraCosts(61), { count: 2, itemId: ITEM_ID }] };
    expect(discountShopGood(mixedGood, DISCOUNT_LEVEL).costs).toStrictEqual([
      { count: 50, itemId: MORA_ITEM_ID },
      { count: 2, itemId: ITEM_ID },
    ]);
  });
});
