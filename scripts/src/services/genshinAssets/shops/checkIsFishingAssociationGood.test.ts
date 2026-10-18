import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { checkIsFishingAssociationGood } from "#src/services/genshinAssets/shops/checkIsFishingAssociationGood";
import { describe, expect, test } from "vitest";

describe(checkIsFishingAssociationGood, () => {
  const FISHING_SHOP_TYPE = 1065;
  const OTHER_SHOP_TYPE = 1001;
  const FISH_ID = 9001;
  const OTHER_FISH_ID = 9002;
  const createRow = (overrides: Partial<ExcelShopGoodsRow>): ExcelShopGoodsRow => ({
    beginTime: "",
    buyLimit: 0,
    costHcoin: 0,
    costItems: [{ count: 2, id: FISH_ID }],
    costMcoin: 0,
    costScoin: 0,
    endTime: "",
    goodsId: 1,
    itemCount: 1,
    itemId: 3001,
    minPlayerLevel: 1,
    rotateId: 0,
    shopType: FISHING_SHOP_TYPE,
    subTabId: 0,
    ...overrides,
  });

  test("takes a good of a fishing shop that one fish prices", () => {
    expect.hasAssertions();

    expect(checkIsFishingAssociationGood(createRow({}))).toBe(true);
  });

  test("leaves out a good of a fishing shop that several fish price", () => {
    expect.hasAssertions();

    const row = createRow({
      costItems: [
        { count: 2, id: FISH_ID },
        { count: 1, id: OTHER_FISH_ID },
      ],
    });
    expect(checkIsFishingAssociationGood(row)).toBe(false);
  });

  test("leaves out a good of a shop that is no fishing shop", () => {
    expect.hasAssertions();

    expect(checkIsFishingAssociationGood(createRow({ shopType: OTHER_SHOP_TYPE }))).toBe(false);
  });
});
