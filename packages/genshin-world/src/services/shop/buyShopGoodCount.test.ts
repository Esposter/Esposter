import type { ShopGood } from "#src/models/shop/ShopGood";

import { Currency } from "#src/models/inventory/Currency";
import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { buyShopGoodCount } from "#src/services/shop/buyShopGoodCount";
import { describe, expect, test } from "vitest";

//  A currency good gives its currency and never reads the bag's definition, so none is returned
const getNoItemDefinition = () => {
  throw new Error("a currency good is not defined as an item");
};

describe(buyShopGoodCount, () => {
  const ADVENTURE_RANK = 4;
  const MORA_PRICE = 3;
  const ANEMO_SIGIL_ITEM_ID = 305;
  const MORA_ITEM_ID = 202;
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const NOW = EPOCH.add({ hours: 24 * 40 });
  const GOOD: ShopGood = {
    beginTime: EPOCH.toString(),
    buyLimit: 0,
    endTime: EPOCH.add({ hours: 876_000 }).toString(),
    goodsId: 1,
    itemCount: 1,
    itemId: ANEMO_SIGIL_ITEM_ID,
    minPlayerLevel: 1,
    priceCount: MORA_PRICE,
    priceItemId: MORA_ITEM_ID,
    refresh: ShopRefresh.None,
  };

  test("buying a good from the screen spends its price and gives the good", () => {
    expect.hasAssertions();
    const { purchases, wallet } = buyShopGoodCount(
      { ...EMPTY_WALLET, [Currency.Mora]: 100 },
      EMPTY_INVENTORY,
      getNoItemDefinition,
      [],
      GOOD,
      2,
      ADVENTURE_RANK,
      NOW,
    );
    expect(wallet[Currency.Mora]).toBe(100 - MORA_PRICE * 2);
    expect(wallet[Currency.AnemoSigil]).toBe(2);
    expect(purchases).toHaveLength(2);
  });

  test("a count past what the player can pay buys what it can", () => {
    expect.hasAssertions();
    const { wallet } = buyShopGoodCount(
      { ...EMPTY_WALLET, [Currency.Mora]: 7 },
      EMPTY_INVENTORY,
      getNoItemDefinition,
      [],
      GOOD,
      5,
      ADVENTURE_RANK,
      NOW,
    );
    expect(wallet[Currency.Mora]).toBe(1);
    expect(wallet[Currency.AnemoSigil]).toBe(2);
  });
});
