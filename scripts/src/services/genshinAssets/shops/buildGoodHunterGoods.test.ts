import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { ShopRefresh } from "#src/models/genshinAssets/shops/ShopRefresh";
import { buildGoodHunterGoods } from "#src/services/genshinAssets/shops/buildGoodHunterGoods";
import { GOOD_HUNTER_SHOP_TYPE, MORA_ITEM_ID } from "#src/services/genshinAssets/shops/constants";
import { readCityDiscountLevel } from "#src/services/genshinAssets/shops/readCityDiscountLevel";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world/definitions";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinAssets/shops/readCityDiscountLevel"));
vi.mock(import("#src/services/genshinText/readExcelTable"));

describe(buildGoodHunterGoods, () => {
  // A made-up discount level and good id, which the test reads back rather than any game value
  const DISCOUNT_LEVEL = 4;
  const GOOD_ID = 1;
  const goodRow: ExcelShopGoodsRow = {
    beginTime: "1970-01-01 00:00:00",
    buyLimit: 0,
    costHcoin: 0,
    costItems: [],
    costMcoin: 0,
    costScoin: 100,
    endTime: "1970-01-01 00:00:00",
    goodsId: GOOD_ID,
    itemCount: 1,
    itemId: 1,
    minPlayerLevel: 1,
    rotateId: 0,
    shopType: GOOD_HUNTER_SHOP_TYPE,
    subTabId: 0,
  };

  test("the Good Hunter's goods take the Mondstadt discount at its level", () => {
    expect.hasAssertions();

    vi.mocked(readCityDiscountLevel).mockReturnValueOnce(DISCOUNT_LEVEL);
    vi.mocked(readExcelTable).mockReturnValueOnce([goodRow]);

    expect(buildGoodHunterGoods()).toStrictEqual({
      [`${GameDataset.Shops}/goodHunter`]: [
        {
          beginTime: "1970-01-01T00:00:00+08:00",
          buyLimit: 0,
          costs: [{ count: 100, itemId: MORA_ITEM_ID }],
          endTime: "1970-01-01T00:00:00+08:00",
          goodsId: GOOD_ID,
          itemCount: 1,
          itemId: 1,
          minPlayerLevel: 1,
          refresh: ShopRefresh.None,
          reputationDiscountLevel: DISCOUNT_LEVEL,
        },
      ],
    });
  });
});
