import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { checkIsPaimonsBargainsFateGood } from "#src/services/genshinAssets/shops/checkIsPaimonsBargainsFateGood";
import { PAIMON_BARGAINS_SHOP_TYPE } from "#src/services/genshinAssets/shops/constants";
import { describe, expect, test } from "vitest";

describe(checkIsPaimonsBargainsFateGood, () => {
  const FATE_ITEM_ID = 223;
  const STARGLITTER_ITEM_ID = 221;
  const PRICE_COUNT = 5;
  const GOODS_ID = 102_003;
  const MONTHLY_REFRESH_TYPE = "SHOP_REFRESH_MONTHLY";
  const fateGood: ExcelShopGoodsRow = {
    beginTime: "1970-01-01 00:00:00",
    buyLimit: 0,
    costHcoin: 0,
    costItems: [{ count: PRICE_COUNT, id: STARGLITTER_ITEM_ID }, {}],
    costMcoin: 0,
    costScoin: 0,
    endTime: "1970-01-02 00:00:00",
    goodsId: GOODS_ID,
    itemCount: 1,
    itemId: FATE_ITEM_ID,
    minPlayerLevel: 4,
    refreshType: MONTHLY_REFRESH_TYPE,
    rotateId: 0,
    shopType: PAIMON_BARGAINS_SHOP_TYPE,
  };

  test("should accept a monthly Fate bought with a Masterless currency", () => {
    expect.hasAssertions();

    expect(checkIsPaimonsBargainsFateGood(fateGood)).toBe(true);
  });

  test("should reject a Fate bought with Primogems, which the inventory sells", () => {
    expect.hasAssertions();

    expect(checkIsPaimonsBargainsFateGood({ ...fateGood, costHcoin: 160, costItems: [{}, {}] })).toBe(false);
  });

  test("should reject a rotation's good, which is the next step", () => {
    expect.hasAssertions();

    expect(checkIsPaimonsBargainsFateGood({ ...fateGood, rotateId: 10_201 })).toBe(false);
  });

  test("should reject a good of another shop", () => {
    expect.hasAssertions();

    expect(checkIsPaimonsBargainsFateGood({ ...fateGood, shopType: 1002 })).toBe(false);
  });
});
