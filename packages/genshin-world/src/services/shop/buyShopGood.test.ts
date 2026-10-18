import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { ShopGood } from "#src/models/shop/ShopGood";

import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { INVENTORY_KIND_LIMIT } from "#src/services/inventory/bagLimits";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { buyShopGood } from "#src/services/shop/buyShopGood";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(buyShopGood, () => {
  const ADVENTURE_RANK = 4;
  const STARGLITTER_PRICE = 5;
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // Forty days past the epoch, a morning in February, after the month's refresh on its first and today's at four
  const NOW = EPOCH.add({ hours: 24 * 40 });
  const DAILY_REFRESH = NOW.subtract({ hours: 4 });
  // A Fate is a currency, so its purchase never asks for a definition
  const getNoItemDefinition = (itemId: number): ItemDefinition => {
    throw new Error(`no definition asked for item ${itemId}`);
  };
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
    refresh: ShopRefresh.Monthly,
  };
  const limitedGood: ShopGood = { ...fateGood, buyLimit: 1 };

  const GROCERY_ITEM_ID = 3000;
  const GROCERY_NAME_TEXT_ID = "1";
  const GROCERY_NAME = "Ingredient";
  const MORA_PRICE = 3;
  // A Souvenir Shop's goods are paid in its region's Sigil, here Mondstadt's Anemo Sigil, and give Mora or an item
  const ANEMO_SIGIL_ITEM_ID = 305;
  const SIGIL_PRICE = 2;
  const SIGIL_MORA_COUNT = 5;
  const groceryMaterial: MaterialData = {
    id: GROCERY_ITEM_ID,
    materialType: MaterialType.Exchange,
    nameTextId: GROCERY_NAME_TEXT_ID,
    rank: 1,
    rarity: 1,
    stackLimit: 99,
  };
  const getGroceryItemDefinition = (itemId: number) =>
    getItemDefinition(itemId, { [GROCERY_NAME_TEXT_ID]: GROCERY_NAME }, new Map([[GROCERY_ITEM_ID, groceryMaterial]]));
  const groceryGood: ShopGood = {
    beginTime: EPOCH.toString(),
    buyLimit: 0,
    endTime: EPOCH.add({ hours: 24 * 365 }).toString(),
    goodsId: 3001,
    itemCount: 1,
    itemId: GROCERY_ITEM_ID,
    minPlayerLevel: ADVENTURE_RANK,
    priceCount: MORA_PRICE,
    priceItemId: MORA_ITEM_ID,
    refresh: ShopRefresh.None,
  };

  test("should take the price and give the item's currency, recording the purchase at its moment", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: STARGLITTER_PRICE * 2 };
    const result = buyShopGood(wallet, EMPTY_INVENTORY, getNoItemDefinition, [], fateGood, ADVENTURE_RANK, NOW);

    expect(result?.wallet[Currency.MasterlessStarglitter]).toBe(STARGLITTER_PRICE);
    expect(result?.wallet[Currency.IntertwinedFate]).toBe(1);
    expect(result?.inventory).toStrictEqual(EMPTY_INVENTORY);
    expect(result?.purchases).toStrictEqual([{ goodsId: fateGood.goodsId, purchasedAt: NOW }]);
  });

  test("should refuse a good the wallet cannot pay for", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: STARGLITTER_PRICE - 1 };

    expect(
      buyShopGood(wallet, EMPTY_INVENTORY, getNoItemDefinition, [], fateGood, ADVENTURE_RANK, NOW),
    ).toBeUndefined();
  });

  test("should refuse a good below the Adventure Rank it shows from", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: STARGLITTER_PRICE };

    expect(
      buyShopGood(wallet, EMPTY_INVENTORY, getNoItemDefinition, [], fateGood, ADVENTURE_RANK - 1, NOW),
    ).toBeUndefined();
  });

  test("should refuse a limited good bought up this month, and offer it again after a purchase made before the refresh", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: STARGLITTER_PRICE * 2 };
    const boughtThisMonth = [{ goodsId: limitedGood.goodsId, purchasedAt: NOW.subtract({ hours: 24 }) }];
    const boughtLastMonth = [{ goodsId: limitedGood.goodsId, purchasedAt: NOW.subtract({ hours: 24 * 10 }) }];

    expect(
      buyShopGood(wallet, EMPTY_INVENTORY, getNoItemDefinition, boughtThisMonth, limitedGood, ADVENTURE_RANK, NOW),
    ).toBeUndefined();
    expect(
      buyShopGood(wallet, EMPTY_INVENTORY, getNoItemDefinition, boughtLastMonth, limitedGood, ADVENTURE_RANK, NOW),
    ).toBeDefined();
  });

  test("a daily good's limit returns at the daily refresh", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: STARGLITTER_PRICE * 2 };
    const dailyGood = { ...limitedGood, refresh: ShopRefresh.Daily };
    const boughtBeforeRefresh = [{ goodsId: dailyGood.goodsId, purchasedAt: DAILY_REFRESH.subtract({ hours: 1 }) }];
    const boughtAfterRefresh = [{ goodsId: dailyGood.goodsId, purchasedAt: DAILY_REFRESH.add({ hours: 1 }) }];

    expect(
      buyShopGood(wallet, EMPTY_INVENTORY, getNoItemDefinition, boughtBeforeRefresh, dailyGood, ADVENTURE_RANK, NOW),
    ).toBeDefined();
    expect(
      buyShopGood(wallet, EMPTY_INVENTORY, getNoItemDefinition, boughtAfterRefresh, dailyGood, ADVENTURE_RANK, NOW),
    ).toBeUndefined();
  });

  test("a good with no refresh stays bought", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: STARGLITTER_PRICE * 2 };
    const unrefreshedGood = { ...limitedGood, refresh: ShopRefresh.None };
    const bought = [{ goodsId: unrefreshedGood.goodsId, purchasedAt: NOW.subtract({ hours: 24 * 5 }) }];

    expect(
      buyShopGood(wallet, EMPTY_INVENTORY, getNoItemDefinition, bought, unrefreshedGood, ADVENTURE_RANK, NOW),
    ).toBeUndefined();
    expect(
      buyShopGood(
        wallet,
        EMPTY_INVENTORY,
        getNoItemDefinition,
        bought,
        unrefreshedGood,
        ADVENTURE_RANK,
        NOW.add({ hours: 24 }),
      ),
    ).toBeUndefined();
  });

  test("a good is not offered outside its sale dates", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: STARGLITTER_PRICE };
    const notYetBegun = { ...fateGood, beginTime: NOW.add({ hours: 1 }).toString() };
    const ended = { ...fateGood, endTime: NOW.subtract({ hours: 1 }).toString() };

    expect(
      buyShopGood(wallet, EMPTY_INVENTORY, getNoItemDefinition, [], notYetBegun, ADVENTURE_RANK, NOW),
    ).toBeUndefined();
    expect(buyShopGood(wallet, EMPTY_INVENTORY, getNoItemDefinition, [], ended, ADVENTURE_RANK, NOW)).toBeUndefined();
  });

  test("buying a grocery ingredient into an empty bag adds it to the bag", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: MORA_PRICE * 2 };
    const result = buyShopGood(wallet, EMPTY_INVENTORY, getGroceryItemDefinition, [], groceryGood, ADVENTURE_RANK, NOW);

    expect(result?.wallet[Currency.Mora]).toBe(MORA_PRICE);
    expect(result?.inventory.items).toStrictEqual([
      {
        definition: {
          category: ItemCategory.Material,
          id: GROCERY_ITEM_ID,
          name: GROCERY_NAME,
          rank: groceryMaterial.rank,
          rarity: groceryMaterial.rarity,
          stackLimit: groceryMaterial.stackLimit,
        },
        id: 0,
        quantity: 1,
      },
    ]);
  });

  test("sigils are traded for materials, blueprints and Mora", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.AnemoSigil]: SIGIL_PRICE * 2 };
    const moraGood: ShopGood = {
      ...groceryGood,
      goodsId: 3002,
      itemCount: SIGIL_MORA_COUNT,
      itemId: MORA_ITEM_ID,
      priceCount: SIGIL_PRICE,
      priceItemId: ANEMO_SIGIL_ITEM_ID,
    };
    const moraResult = buyShopGood(
      wallet,
      EMPTY_INVENTORY,
      getGroceryItemDefinition,
      [],
      moraGood,
      ADVENTURE_RANK,
      NOW,
    );

    expect(moraResult?.wallet[Currency.AnemoSigil]).toBe(SIGIL_PRICE);
    expect(moraResult?.wallet[Currency.Mora]).toBe(SIGIL_MORA_COUNT);
    const materialGood: ShopGood = {
      ...groceryGood,
      goodsId: 3003,
      priceCount: SIGIL_PRICE,
      priceItemId: ANEMO_SIGIL_ITEM_ID,
    };
    const materialResult = buyShopGood(
      wallet,
      EMPTY_INVENTORY,
      getGroceryItemDefinition,
      [],
      materialGood,
      ADVENTURE_RANK,
      NOW,
    );

    expect(materialResult?.wallet[Currency.AnemoSigil]).toBe(SIGIL_PRICE);
    expect(materialResult?.inventory.items.map(({ definition }) => definition.id)).toStrictEqual([GROCERY_ITEM_ID]);
  });

  test("a purchase the bag cannot hold whole is refused", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: MORA_PRICE * 2 };
    const fullBag: Inventory = {
      items: Array.from({ length: INVENTORY_KIND_LIMIT }, (_value, index) => ({
        definition: {
          category: ItemCategory.Material,
          id: index + 1,
          name: GROCERY_NAME,
          rank: groceryMaterial.rank,
          rarity: groceryMaterial.rarity,
          stackLimit: groceryMaterial.stackLimit,
        },
        id: index,
        quantity: 1,
      })),
      nextId: INVENTORY_KIND_LIMIT,
    };

    expect(
      buyShopGood(wallet, fullBag, getGroceryItemDefinition, [], groceryGood, ADVENTURE_RANK, NOW),
    ).toBeUndefined();
  });
});
