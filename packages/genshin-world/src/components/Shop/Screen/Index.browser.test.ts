import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood } from "#src/models/shop/ShopGood";

import ShopScreen from "#src/components/Shop/Screen/Index.vue";
import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { defineComponent, h, nextTick } from "vue";

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
const nameText = { "301": "made up currency", "302": "made up treasure", "303": "made up furnishing" };
const materialDataMap = new Map<number, MaterialData>(
  [PRICE_ITEM_ID, TREASURE_ITEM_ID, FURNISHING_ITEM_ID].map((id) => [
    id,
    { id, materialType: MaterialType.Consume, nameTextId: String(id), rank: 1, rarity: 1, stackLimit: 1 },
  ]),
);
const good = (goodsId: number, itemId: number, tabId: number): ShopGood => ({
  beginTime: new Date(0).toISOString(),
  buyLimit: 0,
  endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ days: 36_500 }).toString(),
  goodsId,
  itemCount: 1,
  itemId,
  minPlayerLevel: 1,
  priceCount: 1,
  priceItemId: PRICE_ITEM_ID,
  refresh: ShopRefresh.None,
  tabId,
});
const inventory: Inventory = { items: [], nextId: 1, quickSwapItemIds: [] };
const wallet: Wallet = {
  ...Object.fromEntries(Object.values(Currency).map((currency) => [currency, 0])),
  originalResinChangedAt: Temporal.Instant.fromEpochMilliseconds(0),
  primogemResinRefillCount: 0,
  primogemResinRefillDay: Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC").toPlainDate(),
};

// The tabs' and the goods' names as the screen shows them
const readTabNames = () => Array.from(document.querySelectorAll(".tab"), (tab) => tab.textContent?.trim());
const readGoodNames = () => Array.from(document.querySelectorAll(".good-name"), (name) => name.textContent?.trim());

describe("shopScreen", () => {
  // Tubby's depot opens on the first of its tabs, with that tab's goods, and a click on another tab shows its own goods
  test("tubby's depot opens on its first tab", async () => {
    expect.hasAssertions();

    render(
      defineComponent({
        setup: () => () =>
          h(ShopScreen, {
            adventureRank: 60,
            gameText,
            goods: [good(1, TREASURE_ITEM_ID, TREASURE_TAB_ID), good(2, FURNISHING_ITEM_ID, FURNISHING_TAB_ID)],
            inventory,
            materialDataMap,
            nameText,
            purchases: [],
            reputationLevel: 1,
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
