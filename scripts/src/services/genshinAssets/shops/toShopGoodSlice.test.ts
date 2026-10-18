import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { MONDSTADT_GENERAL_GOODS_SHOP_TYPE } from "#src/services/genshinAssets/shops/constants";
import { toShopGoodSlice } from "#src/services/genshinAssets/shops/toShopGoodSlice";
import { describe, expect, test } from "vitest";

// A table date in the table's own shape, computed from the epoch
const EPOCH_TIME = new Date(0).toISOString().slice(0, 19).replace("T", " ");
// Mondstadt's Flora vendor, a shop the discount names no part of
const UNNAMED_SHOP_TYPE = 1011;
const DISCOUNT_LEVEL = 4;
const DISCOUNT = { level: DISCOUNT_LEVEL, shopTypes: [MONDSTADT_GENERAL_GOODS_SHOP_TYPE] };
const createRow = (overrides: Partial<ExcelShopGoodsRow>): ExcelShopGoodsRow => ({
  beginTime: EPOCH_TIME,
  buyLimit: 0,
  costHcoin: 0,
  costItems: [],
  costMcoin: 0,
  costScoin: 100,
  endTime: EPOCH_TIME,
  goodsId: 1,
  itemCount: 1,
  itemId: 1,
  minPlayerLevel: 1,
  rotateId: 0,
  shopType: MONDSTADT_GENERAL_GOODS_SHOP_TYPE,
  subTabId: 0,
  ...overrides,
});

describe(toShopGoodSlice, () => {
  test("a discount applies at its named shop", () => {
    expect.hasAssertions();

    const [good] = toShopGoodSlice([createRow({ shopType: MONDSTADT_GENERAL_GOODS_SHOP_TYPE })], () => true, DISCOUNT);

    expect(good?.reputationDiscountLevel).toBe(DISCOUNT_LEVEL);
  });

  test("a discount does not apply at an unnamed shop", () => {
    expect.hasAssertions();

    const [good] = toShopGoodSlice([createRow({ shopType: UNNAMED_SHOP_TYPE })], () => true, DISCOUNT);

    expect(good?.reputationDiscountLevel).toBeUndefined();
  });
});
