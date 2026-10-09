import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { toShopGoodRow } from "#src/services/genshinAssets/shops/toShopGoodRow";
import { describe, expect, test } from "vitest";

describe(toShopGoodRow, () => {
  const FATE_ITEM_ID = 224;
  const STARDUST_ITEM_ID = 222;
  const PRICE_COUNT = 75;
  const GOODS_ID = 102_502;
  const BUY_LIMIT = 5;
  const MIN_PLAYER_LEVEL = 4;
  const row: ExcelShopGoodsRow = {
    beginTime: "1970-01-01 00:00:00",
    buyLimit: BUY_LIMIT,
    costHcoin: 0,
    costItems: [{ count: PRICE_COUNT, id: STARDUST_ITEM_ID }, {}],
    costMcoin: 0,
    costScoin: 0,
    endTime: "1970-01-02 00:00:00",
    goodsId: GOODS_ID,
    itemCount: 1,
    itemId: FATE_ITEM_ID,
    minPlayerLevel: MIN_PLAYER_LEVEL,
    refreshType: "SHOP_REFRESH_MONTHLY",
    rotateId: 0,
    shopType: 1001,
  };

  test("should write the good's price and dates, the dates at the game's offset", () => {
    expect.hasAssertions();

    expect(toShopGoodRow(row)).toStrictEqual({
      beginTime: "1970-01-01T00:00:00+08:00",
      buyLimit: BUY_LIMIT,
      endTime: "1970-01-02T00:00:00+08:00",
      goodsId: GOODS_ID,
      itemCount: 1,
      itemId: FATE_ITEM_ID,
      minPlayerLevel: MIN_PLAYER_LEVEL,
      priceCount: PRICE_COUNT,
      priceItemId: STARDUST_ITEM_ID,
    });
  });
});
