import { Currency } from "#src/models/inventory/Currency";
import { WishItemKind } from "#src/models/wish/WishItemKind";
import {
  CONSTELLATION_COUNT,
  FIVE_STAR_COMPLETE_STARGLITTER,
  FIVE_STAR_DUPLICATE_STARGLITTER,
  FIVE_STAR_WEAPON_STARGLITTER,
  FOUR_STAR_COMPLETE_STARGLITTER,
  FOUR_STAR_DUPLICATE_STARGLITTER,
  FOUR_STAR_WEAPON_STARGLITTER,
  THREE_STAR_WEAPON_STARDUST,
} from "#src/services/wish/constants";
import { getWishReturn } from "#src/services/wish/getWishReturn";
import { describe, expect, test } from "vitest";

describe(getWishReturn, () => {
  test.each([
    [WishItemKind.Character, 5, CONSTELLATION_COUNT, FIVE_STAR_DUPLICATE_STARGLITTER],
    [WishItemKind.Character, 5, CONSTELLATION_COUNT + 1, FIVE_STAR_COMPLETE_STARGLITTER],
    [WishItemKind.Character, 4, 1, FOUR_STAR_DUPLICATE_STARGLITTER],
    [WishItemKind.Character, 4, CONSTELLATION_COUNT + 1, FOUR_STAR_COMPLETE_STARGLITTER],
    [WishItemKind.Weapon, 5, 0, FIVE_STAR_WEAPON_STARGLITTER],
    [WishItemKind.Weapon, 4, 0, FOUR_STAR_WEAPON_STARGLITTER],
  ])("returns Starglitter for a %s of %s stars with %s held", (kind, rarity, heldCount, quantity) => {
    expect.hasAssertions();

    expect(getWishReturn({ id: 0, kind, rarity }, heldCount)).toStrictEqual({
      currency: Currency.MasterlessStarglitter,
      quantity,
    });
  });

  test("returns Stardust for a three-star weapon", () => {
    expect.hasAssertions();

    expect(getWishReturn({ id: 0, kind: WishItemKind.Weapon, rarity: 3 }, 0)).toStrictEqual({
      currency: Currency.MasterlessStardust,
      quantity: THREE_STAR_WEAPON_STARDUST,
    });
  });

  test("returns nothing for a new character", () => {
    expect.hasAssertions();

    expect(getWishReturn({ id: 0, kind: WishItemKind.Character, rarity: 5 }, 0)).toBeUndefined();
  });
});
