import type { PaimonsBargainsRotation } from "#src/models/shop/PaimonsBargainsRotation";

import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { getPaimonsBargainsGoods } from "#src/services/shop/getPaimonsBargainsGoods";
import { describe, expect, test } from "vitest";

describe(getPaimonsBargainsGoods, () => {
  const rotation: PaimonsBargainsRotation = {
    blackcliffWeaponIds: [21, 22, 23, 24, 25],
    characterGoodIds: [41, 42],
    characterPairs: [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
      [9, 10],
      [11, 12],
    ],
    characterPrice: { buyLimit: 1, priceCount: 3, priceItemId: 221, refresh: ShopRefresh.Monthly },
    royalWeaponIds: [31, 32, 33, 34, 35],
    weaponGoodIds: [51, 52, 53, 54, 55],
    weaponPrice: { buyLimit: 2, priceCount: 4, priceItemId: 221, refresh: ShopRefresh.Monthly },
  };

  test("each offered character and weapon is the good of its slot at its rotation's price", () => {
    expect.hasAssertions();

    // January's pair is the fourth, and its weapon set Blackcliff, the odd month's
    const { characterGoods, weaponGoods } = getPaimonsBargainsGoods(
      rotation,
      Temporal.ZonedDateTime.from({ day: 15, month: 1, timeZone: "+08:00", year: 2026 }).toInstant(),
    );

    expect(characterGoods).toStrictEqual([
      {
        buyLimit: 1,
        goodsId: 41,
        itemCount: 1,
        itemId: 7,
        priceCount: 3,
        priceItemId: 221,
        refresh: ShopRefresh.Monthly,
      },
      {
        buyLimit: 1,
        goodsId: 42,
        itemCount: 1,
        itemId: 8,
        priceCount: 3,
        priceItemId: 221,
        refresh: ShopRefresh.Monthly,
      },
    ]);
    expect(weaponGoods.map(({ goodsId, itemId }) => ({ goodsId, itemId }))).toStrictEqual(
      rotation.blackcliffWeaponIds.map((weaponId, slot) => ({
        goodsId: rotation.weaponGoodIds[slot],
        itemId: weaponId,
      })),
    );
  });
});
