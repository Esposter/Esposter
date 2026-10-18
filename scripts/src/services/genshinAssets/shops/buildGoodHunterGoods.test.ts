import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { ShopRefresh } from "#src/models/genshinAssets/shops/ShopRefresh";
import { buildGoodHunterGoods } from "#src/services/genshinAssets/shops/buildGoodHunterGoods";
import { GAME_TIME_OFFSET, GOOD_HUNTER_SHOP_TYPE, MORA_ITEM_ID } from "#src/services/genshinAssets/shops/constants";
import { readCityDiscountLevel } from "#src/services/genshinAssets/shops/readCityDiscountLevel";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinAssets/shops/readCityDiscountLevel"));
vi.mock(import("#src/services/genshinText/readExcelTable"));

// A table date in the table's own shape, computed from the epoch
const EPOCH_TIME = new Date(0).toISOString().slice(0, 19).replace("T", " ");
// A made-up discount level and good id, which the test reads back rather than any game value
const DISCOUNT_LEVEL = 4;
const GOOD_ID = 1;
const goodRow: ExcelShopGoodsRow = {
  beginTime: EPOCH_TIME,
  buyLimit: 0,
  costHcoin: 0,
  costItems: [],
  costMcoin: 0,
  costScoin: 100,
  endTime: EPOCH_TIME,
  goodsId: GOOD_ID,
  itemCount: 1,
  itemId: 1,
  minPlayerLevel: 1,
  rotateId: 0,
  shopType: GOOD_HUNTER_SHOP_TYPE,
  subTabId: 0,
};

describe(buildGoodHunterGoods, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("the Good Hunter's goods take the Mondstadt discount at its level", () => {
    expect.hasAssertions();

    vi.mocked(readCityDiscountLevel).mockReturnValueOnce(DISCOUNT_LEVEL);
    vi.mocked(readExcelTable).mockReturnValueOnce([goodRow]);

    expect(buildGoodHunterGoods()).toStrictEqual({
      [`${GameDataset.Shops}/goodHunter`]: [
        {
          beginTime: `${EPOCH_TIME.replace(" ", "T")}${GAME_TIME_OFFSET}`,
          buyLimit: 0,
          endTime: `${EPOCH_TIME.replace(" ", "T")}${GAME_TIME_OFFSET}`,
          goodsId: GOOD_ID,
          itemCount: 1,
          itemId: 1,
          minPlayerLevel: 1,
          priceCount: 100,
          priceItemId: MORA_ITEM_ID,
          refresh: ShopRefresh.None,
          reputationDiscountLevel: DISCOUNT_LEVEL,
        },
      ],
    });
  });
});
