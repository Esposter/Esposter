import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { ShopRefresh } from "#src/models/genshinAssets/shops/ShopRefresh";
import { buildRealmDepotGoods } from "#src/services/genshinAssets/shops/buildRealmDepotGoods";
import { GAME_TIME_OFFSET, MORA_ITEM_ID, REALM_DEPOT_SHOP_TYPE } from "#src/services/genshinAssets/shops/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinText/readExcelTable"));

// A table date in the table's own shape, computed from the epoch
const EPOCH_TIME = new Date(0).toISOString().slice(0, 19).replace("T", " ");
// Made-up good ids, and a sub tab of the depot each good is filed under, which the test reads back
const TREASURE_GOOD_ID = 1;
const FURNISHING_GOOD_ID = 2;
const OTHER_SHOP_GOOD_ID = 3;
const TREASURE_SUB_TAB_ID = 1;
const FURNISHING_SUB_TAB_ID = 2;
const OTHER_SHOP_TYPE = 1001;
const goodRow = (goodsId: number, shopType: number, subTabId: number): ExcelShopGoodsRow => ({
  beginTime: EPOCH_TIME,
  buyLimit: 0,
  costHcoin: 0,
  costItems: [],
  costMcoin: 0,
  costScoin: 100,
  endTime: EPOCH_TIME,
  goodsId,
  itemCount: 1,
  itemId: 1,
  minPlayerLevel: 1,
  rotateId: 0,
  shopType,
  subTabId,
});
// The good as the shops dataset holds it, its dates with the game's offset and the sub tab it is shown on
const publishedGood = (goodsId: number, tabId: number) => ({
  beginTime: `${EPOCH_TIME.replace(" ", "T")}${GAME_TIME_OFFSET}`,
  buyLimit: 0,
  endTime: `${EPOCH_TIME.replace(" ", "T")}${GAME_TIME_OFFSET}`,
  goodsId,
  itemCount: 1,
  itemId: 1,
  minPlayerLevel: 1,
  priceCount: 100,
  priceItemId: MORA_ITEM_ID,
  refresh: ShopRefresh.None,
  tabId,
});

describe(buildRealmDepotGoods, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("each depot good is in its own sub tab's record and names that tab, and another shop's goods are left out", () => {
    expect.hasAssertions();

    vi.mocked(readExcelTable).mockReturnValueOnce([
      goodRow(TREASURE_GOOD_ID, REALM_DEPOT_SHOP_TYPE, TREASURE_SUB_TAB_ID),
      goodRow(FURNISHING_GOOD_ID, REALM_DEPOT_SHOP_TYPE, FURNISHING_SUB_TAB_ID),
      goodRow(OTHER_SHOP_GOOD_ID, OTHER_SHOP_TYPE, FURNISHING_SUB_TAB_ID),
    ]);

    expect(buildRealmDepotGoods()).toStrictEqual({
      [`${GameDataset.Shops}/realmDepotTreasures`]: [publishedGood(TREASURE_GOOD_ID, TREASURE_SUB_TAB_ID)],
      [`${GameDataset.Shops}/realmDepotFurnishings`]: [publishedGood(FURNISHING_GOOD_ID, FURNISHING_SUB_TAB_ID)],
      [`${GameDataset.Shops}/realmDepotBlueprints`]: [],
      [`${GameDataset.Shops}/realmDepotRiches`]: [],
      [`${GameDataset.Shops}/realmDepotCreatures`]: [],
      [`${GameDataset.Shops}/realmDepotWood`]: [],
    });
  });
});
