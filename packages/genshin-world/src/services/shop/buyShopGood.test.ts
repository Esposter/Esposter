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

// A Fate is a currency, so its purchase never asks for a definition
const getNoItemDefinition = (itemId: number): ItemDefinition => {
  throw new Error(`no definition asked for item ${itemId}`);
};

describe(buyShopGood, () => {
  const ADVENTURE_RANK = 4;
  const STARGLITTER_PRICE = 5;
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // Forty days past the epoch, a morning in February, after the month's refresh on its first and today's at four
  const NOW = EPOCH.add({ hours: 24 * 40 });
  const DAILY_REFRESH = NOW.subtract({ hours: 4 });
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

  test("should take the price and give the item's currency, keeping no purchase of a good with no limit", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: STARGLITTER_PRICE * 2 };
    const result = buyShopGood(wallet, EMPTY_INVENTORY, getNoItemDefinition, [], fateGood, ADVENTURE_RANK, NOW);

    expect(result?.wallet[Currency.MasterlessStarglitter]).toBe(STARGLITTER_PRICE);
    expect(result?.wallet[Currency.IntertwinedFate]).toBe(1);
    expect(result?.inventory).toStrictEqual(EMPTY_INVENTORY);
    expect(result?.purchases).toStrictEqual([]);
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
    const boughtThisMonth = [{ count: 1, goodsId: limitedGood.goodsId, lastPurchasedAt: NOW.subtract({ hours: 24 }) }];
    const boughtLastMonth = [
      { count: 1, goodsId: limitedGood.goodsId, lastPurchasedAt: NOW.subtract({ hours: 24 * 10 }) },
    ];

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
    const boughtBeforeRefresh = [
      { count: 1, goodsId: dailyGood.goodsId, lastPurchasedAt: DAILY_REFRESH.subtract({ hours: 1 }) },
    ];
    const boughtAfterRefresh = [
      { count: 1, goodsId: dailyGood.goodsId, lastPurchasedAt: DAILY_REFRESH.add({ hours: 1 }) },
    ];

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
    const bought = [{ count: 1, goodsId: unrefreshedGood.goodsId, lastPurchasedAt: NOW.subtract({ hours: 24 * 5 }) }];

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
      quickSwapItemIds: [],
    };

    expect(
      buyShopGood(wallet, fullBag, getGroceryItemDefinition, [], groceryGood, ADVENTURE_RANK, NOW),
    ).toBeUndefined();
  });
  const FISH_ITEM_ID = 9001;
  const fishDefinition: ItemDefinition = {
    category: ItemCategory.Material,
    id: FISH_ITEM_ID,
    name: "Fish",
    rank: 1,
    rarity: 1,
    stackLimit: 99,
  };
  // A good a player buys with fish from the bag, as a Fishing Association's bait is bought with Medaka
  const fishPricedGood: ShopGood = { ...groceryGood, goodsId: 3002, priceCount: 2, priceItemId: FISH_ITEM_ID };

  test("a good priced in a fish is paid from the bag and gives its item", () => {
    expect.hasAssertions();

    const inventory = { items: [{ definition: fishDefinition, id: 0, quantity: 2 }], nextId: 1, quickSwapItemIds: [] };
    const result = buyShopGood(
      EMPTY_WALLET,
      inventory,
      getGroceryItemDefinition,
      [],
      fishPricedGood,
      ADVENTURE_RANK,
      NOW,
    );

    expect(result?.inventory.items).toStrictEqual([
      { definition: getGroceryItemDefinition(GROCERY_ITEM_ID), id: 1, quantity: 1 },
    ]);
  });

  test("a good priced in a fish the bag lacks is refused", () => {
    expect.hasAssertions();

    const inventory = { items: [{ definition: fishDefinition, id: 0, quantity: 1 }], nextId: 1, quickSwapItemIds: [] };

    expect(
      buyShopGood(EMPTY_WALLET, inventory, getGroceryItemDefinition, [], fishPricedGood, ADVENTURE_RANK, NOW),
    ).toBeUndefined();
  });

  // The Card Shop sells its cards for Lucky Coins, a material the bag holds, here made up in the same shape as the grocery
  const LUCKY_COIN_ITEM_ID = 3200;
  const CARD_ITEM_ID = 3300;
  const CARD_NAME_TEXT_ID = "2";
  const CARD_NAME = "Card";
  const luckyCoinMaterial: MaterialData = { ...groceryMaterial, id: LUCKY_COIN_ITEM_ID };
  const cardMaterial: MaterialData = { ...groceryMaterial, id: CARD_ITEM_ID };
  const getCardShopItemDefinition = (itemId: number) =>
    getItemDefinition(
      itemId,
      { [GROCERY_NAME_TEXT_ID]: GROCERY_NAME, [CARD_NAME_TEXT_ID]: CARD_NAME },
      new Map([
        [LUCKY_COIN_ITEM_ID, luckyCoinMaterial],
        [CARD_ITEM_ID, cardMaterial],
      ]),
    );
  const cardShopGood: ShopGood = {
    ...groceryGood,
    goodsId: 9001,
    itemId: CARD_ITEM_ID,
    priceCount: 2,
    priceItemId: LUCKY_COIN_ITEM_ID,
  };

  test("a card is bought with Lucky Coins", () => {
    expect.hasAssertions();

    const inventory = {
      items: [{ definition: getCardShopItemDefinition(LUCKY_COIN_ITEM_ID), id: 0, quantity: 3 }],
      nextId: 1,
      quickSwapItemIds: [],
    };
    const result = buyShopGood(
      EMPTY_WALLET,
      inventory,
      getCardShopItemDefinition,
      [],
      cardShopGood,
      ADVENTURE_RANK,
      NOW,
    );

    expect(result?.inventory.items).toStrictEqual([
      { definition: getCardShopItemDefinition(LUCKY_COIN_ITEM_ID), id: 0, quantity: 1 },
      { definition: getCardShopItemDefinition(CARD_ITEM_ID), id: 1, quantity: 1 },
    ]);
  });

  test("a card the player cannot afford is not sold", () => {
    expect.hasAssertions();

    const inventory = {
      items: [{ definition: getCardShopItemDefinition(LUCKY_COIN_ITEM_ID), id: 0, quantity: 1 }],
      nextId: 1,
      quickSwapItemIds: [],
    };

    expect(
      buyShopGood(EMPTY_WALLET, inventory, getCardShopItemDefinition, [], cardShopGood, ADVENTURE_RANK, NOW),
    ).toBeUndefined();
  });
});
