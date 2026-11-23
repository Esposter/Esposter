import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopGoodCost } from "#src/models/shop/ShopGoodCost";

import ShopScreen from "#src/components/Shop/Screen/Index.vue";
import { Currencies } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { MONDSTADT_GENERAL_GOODS_SHOP_ID, REALM_DEPOT_SHOP_ID } from "#src/services/shop/constants";
import { itemRooms } from "#src/store/itemRooms.fixture";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { defineComponent, h, nextTick } from "vue";

// The tabs' and the goods' names as the screen shows them
const readTabNames = () => Array.from(document.querySelectorAll(".tab"), (tab) => tab.textContent?.trim());
const readGoodNames = () => Array.from(document.querySelectorAll(".good-name"), (name) => name.textContent?.trim());
// Each cost a shown good lists, by its count and by the currency its icon is labelled with
const readCostCounts = () => Array.from(document.querySelectorAll(".good-price"), (cost) => cost.textContent?.trim());
const readCostNames = () =>
  Array.from(document.querySelectorAll(".good-price .coin"), (coin) => coin.getAttribute("aria-label"));

describe("shopScreen", () => {
  // Made-up tabs, goods, items and names, which the test reads back on the screen rather than any game value
  const TREASURE_TAB_ID = 1;
  const FURNISHING_TAB_ID = 2;
  const PRICE_ITEM_ID = 301;
  const TREASURE_ITEM_ID = 302;
  const FURNISHING_ITEM_ID = 303;
  const gameText = {
    ...ENGLISH_GAME_TEXT,
    [GameTextKey.InventoryFurnishings]: "made up furnishings",
    [GameTextKey.RealmDepotTreasures]: "made up treasures",
  };
  const nameText = {
    [String(FURNISHING_ITEM_ID)]: "made up furnishing",
    [String(PRICE_ITEM_ID)]: "made up currency",
    [String(TREASURE_ITEM_ID)]: "made up treasure",
  };
  const materialDataMap = new Map<number, MaterialData>(
    [PRICE_ITEM_ID, TREASURE_ITEM_ID, FURNISHING_ITEM_ID].map((id) => [
      id,
      { id, materialType: MaterialType.Consume, nameTextId: String(id), rank: 1, rarity: 1, stackLimit: 1 },
    ]),
  );
  const createGood = (
    goodsId: number,
    itemId: number,
    tabId: number | undefined,
    costs: ShopGoodCost[] = [{ count: 1, itemId: PRICE_ITEM_ID }],
  ): ShopGood => ({
    beginTime: new Date(0).toISOString(),
    buyLimit: 0,
    costs,
    endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 876_000 }).toString(),
    goodsId,
    itemCount: 1,
    itemId,
    minPlayerLevel: 1,
    refresh: ShopRefresh.None,
    tabId,
  });
  const inventory: Inventory = { items: [], nextId: 1, quickSwapItemIds: [] };
  const wallet: Wallet = {
    ...Object.fromEntries(Currencies.map((currency) => [currency, 0])),
    originalResinChangedAt: Temporal.Instant.fromEpochMilliseconds(0),
    primogemResinRefillCount: 0,
    primogemResinRefillDay: Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC").toPlainDate(),
  };
  const now = Temporal.Instant.fromEpochMilliseconds(0);

  // A good is offered at the costs its shop gives the player: a city shop's Mora price at a reputation level
  // Its discount reaches, each cost's count and the currency it is paid in
  test("a good is offered at its shop's costs", async () => {
    expect.hasAssertions();
    const MORA_COST = 60;
    const DISCOUNTED_MORA_COST = 50;
    const DISCOUNT_LEVEL = 4;

    await render(
      defineComponent({
        setup: () => () =>
          h(ShopScreen, {
            adventureRank: 60,
            gameText,
            getWorldNow: () => now,
            goods: [
              {
                ...createGood(1, TREASURE_ITEM_ID, undefined, [{ count: MORA_COST, itemId: MORA_ITEM_ID }]),
                reputationDiscountLevel: DISCOUNT_LEVEL,
              },
            ],
            inventory,
            itemRooms,
            materialDataMap,
            nameText,
            now,
            purchases: [],
            reputationLevel: DISCOUNT_LEVEL,
            shopId: MONDSTADT_GENERAL_GOODS_SHOP_ID,
            wallet,
          }),
      }),
    );

    expect(readCostCounts()).toStrictEqual([String(DISCOUNTED_MORA_COST)]);
    expect(readCostNames()).toStrictEqual([ENGLISH_GAME_TEXT[GameTextKey.Mora]]);
  });

  // Tubby's depot opens on the first of its tabs, with that tab's goods, and a click on another tab shows its own goods
  test("tubby's depot opens on its first tab", async () => {
    expect.hasAssertions();

    await render(
      defineComponent({
        setup: () => () =>
          h(ShopScreen, {
            adventureRank: 60,
            gameText,
            getWorldNow: () => now,
            goods: [
              createGood(1, TREASURE_ITEM_ID, TREASURE_TAB_ID),
              createGood(2, FURNISHING_ITEM_ID, FURNISHING_TAB_ID),
            ],
            inventory,
            itemRooms,
            materialDataMap,
            nameText,
            now,
            purchases: [],
            reputationLevel: 1,
            shopId: REALM_DEPOT_SHOP_ID,
            wallet,
          }),
      }),
    );

    expect(readTabNames()).toStrictEqual(["made up treasures", "made up furnishings"]);
    expect(readGoodNames()).toStrictEqual(["made up treasure"]);

    document.querySelectorAll<HTMLButtonElement>(".tab")[1]?.click();
    await nextTick();

    expect(readGoodNames()).toStrictEqual(["made up furnishing"]);
  });
});
