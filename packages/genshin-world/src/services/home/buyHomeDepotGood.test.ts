import type { ShopGood } from "#src/models/shop/ShopGood";

import { Currency } from "#src/models/inventory/Currency";
import { ItemCategory } from "genshin-interface";
import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { buyHomeDepotGood } from "#src/services/home/buyHomeDepotGood";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { describe, expect, test } from "vitest";

describe(buyHomeDepotGood, () => {
  const ADVENTURE_RANK = 1;
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // The Monday at four in the morning of the game's time, UTC+8, after the epoch's Thursday, a week's refresh
  const WEEKLY_REFRESH = EPOCH.add({ hours: 24 * 4 - 4 });
  const FURNISHING_ID = 360_101;
  const PRICE_COUNT = 10;
  const furnishingDefinition = {
    category: ItemCategory.Furnishing,
    id: FURNISHING_ID,
    name: "",
    rank: 0,
    rarity: 0,
    stackLimit: 1,
  };
  const good: ShopGood = {
    beginTime: EPOCH.toString(),
    buyLimit: 1,
    endTime: EPOCH.add({ hours: 24 * 365 }).toString(),
    goodsId: 213_001,
    itemCount: 1,
    itemId: FURNISHING_ID,
    minPlayerLevel: ADVENTURE_RANK,
    priceCount: PRICE_COUNT,
    priceItemId: 204,
    refresh: ShopRefresh.None,
  };

  test("buying a furnishing from the depot takes Realm Currency", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.RealmCurrency]: PRICE_COUNT * 2 };
    const result = buyHomeDepotGood(good, {
      adventureRank: ADVENTURE_RANK,
      inventory: EMPTY_INVENTORY,
      itemDefinition: furnishingDefinition,
      now: EPOCH,
      purchases: [],
      wallet,
    });

    expect(result?.wallet[Currency.RealmCurrency]).toBe(PRICE_COUNT);
    expect(countInventoryItem(result?.inventory.items ?? [], FURNISHING_ID)).toBe(1);
  });

  test("a purchase the wallet cannot cover is refused", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.RealmCurrency]: PRICE_COUNT - 1 };

    expect(
      buyHomeDepotGood(good, {
        adventureRank: ADVENTURE_RANK,
        inventory: EMPTY_INVENTORY,
        itemDefinition: furnishingDefinition,
        now: EPOCH,
        purchases: [],
        wallet,
      }),
    ).toBeUndefined();
  });

  test("a weekly good's limit returns at its weekly refresh", () => {
    expect.hasAssertions();

    const weeklyGood = { ...good, refresh: ShopRefresh.Weekly };
    const wallet = { ...EMPTY_WALLET, [Currency.RealmCurrency]: PRICE_COUNT * 2 };
    const boughtLastWeek = [{ goodsId: weeklyGood.goodsId, purchasedAt: WEEKLY_REFRESH.subtract({ hours: 1 }) }];
    const boughtThisWeek = [{ goodsId: weeklyGood.goodsId, purchasedAt: WEEKLY_REFRESH.add({ hours: 1 }) }];
    const buy = (purchases: typeof boughtLastWeek, now: Temporal.Instant) =>
      buyHomeDepotGood(weeklyGood, {
        adventureRank: ADVENTURE_RANK,
        inventory: EMPTY_INVENTORY,
        itemDefinition: furnishingDefinition,
        now,
        purchases,
        wallet,
      });

    expect(buy(boughtLastWeek, WEEKLY_REFRESH.add({ hours: 2 }))).toBeDefined();
    expect(buy(boughtThisWeek, WEEKLY_REFRESH.add({ hours: 2 }))).toBeUndefined();
  });
});
