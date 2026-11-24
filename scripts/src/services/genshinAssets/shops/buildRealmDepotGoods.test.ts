import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { ShopRefresh } from "#src/models/genshinAssets/shops/ShopRefresh";
import { buildRealmDepotGoods } from "#src/services/genshinAssets/shops/buildRealmDepotGoods";
import { MORA_ITEM_ID, REALM_DEPOT_SHOP_TYPE } from "#src/services/genshinAssets/shops/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world/definitions";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinText/readExcelTable"));

const createGoodRow = (goodsId: number, shopType: number, subTabId: number): ExcelShopGoodsRow => ({
  beginTime: "1970-01-01 00:00:00",
  buyLimit: 0,
  costHcoin: 0,
  costItems: [],
  costMcoin: 0,
  costScoin: 100,
  endTime: "1970-01-01 00:00:00",
  goodsId,
  itemCount: 1,
  itemId: 1,
  minPlayerLevel: 1,
  rotateId: 0,
  shopType,
  subTabId,
});

// The good as the shops dataset holds it, its dates with the game's offset and the sub tab it is shown on
const createPublishedGood = (goodsId: number, tabId: number) => ({
  beginTime: "1970-01-01T00:00:00+08:00",
  buyLimit: 0,
  costs: [{ count: 100, itemId: MORA_ITEM_ID }],
  endTime: "1970-01-01T00:00:00+08:00",
  goodsId,
  itemCount: 1,
  itemId: 1,
  minPlayerLevel: 1,
  refresh: ShopRefresh.None,
  tabId,
});

describe(buildRealmDepotGoods, () => {
  // Made-up good ids, and a sub tab of the depot each good is filed under, which the test reads back
  const TREASURE_GOOD_ID = 1;
  const FURNISHING_GOOD_ID = 2;
  const OTHER_SHOP_GOOD_ID = 3;
  const TREASURE_SUB_TAB_ID = 1;
  const FURNISHING_SUB_TAB_ID = 2;
  const OTHER_SHOP_TYPE = 1001;

  test("each depot good is in its own sub tab's record and names that tab, and another shop's goods are left out", () => {
    expect.hasAssertions();

    vi.mocked(readExcelTable).mockReturnValueOnce([
      createGoodRow(TREASURE_GOOD_ID, REALM_DEPOT_SHOP_TYPE, TREASURE_SUB_TAB_ID),
      createGoodRow(FURNISHING_GOOD_ID, REALM_DEPOT_SHOP_TYPE, FURNISHING_SUB_TAB_ID),
      createGoodRow(OTHER_SHOP_GOOD_ID, OTHER_SHOP_TYPE, FURNISHING_SUB_TAB_ID),
    ]);

    expect(buildRealmDepotGoods()).toStrictEqual({
      [`${GameDataset.Shops}/realmDepotBlueprints`]: [],
      [`${GameDataset.Shops}/realmDepotCreatures`]: [],
      [`${GameDataset.Shops}/realmDepotFurnishings`]: [createPublishedGood(FURNISHING_GOOD_ID, FURNISHING_SUB_TAB_ID)],
      [`${GameDataset.Shops}/realmDepotRiches`]: [],
      [`${GameDataset.Shops}/realmDepotTreasures`]: [createPublishedGood(TREASURE_GOOD_ID, TREASURE_SUB_TAB_ID)],
      [`${GameDataset.Shops}/realmDepotWood`]: [],
    });
  });
});
