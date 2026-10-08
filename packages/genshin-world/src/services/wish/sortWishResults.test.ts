import type { WishResult } from "#src/models/wish/WishResult";

import { WishItemKind } from "#src/models/wish/WishItemKind";
import { sortWishResults } from "#src/services/wish/sortWishResults";
import { describe, expect, test } from "vitest";

const createResult = (id: number, kind: WishItemKind, rarity: number): WishResult => ({
  isCapturingRadiance: false,
  item: { id, kind, name: "", rarity },
});

describe(sortWishResults, () => {
  test("shows the highest rarity first and a character ahead of a weapon of its rarity, else in the order drawn", () => {
    expect.hasAssertions();

    const threeStar = createResult(0, WishItemKind.Weapon, 3);
    const fourStarWeapon = createResult(1, WishItemKind.Weapon, 4);
    const fourStarCharacter = createResult(2, WishItemKind.Character, 4);
    const fiveStar = createResult(3, WishItemKind.Weapon, 5);
    const secondThreeStar = createResult(4, WishItemKind.Weapon, 3);

    expect(sortWishResults([threeStar, fourStarWeapon, fourStarCharacter, fiveStar, secondThreeStar])).toStrictEqual([
      fiveStar,
      fourStarCharacter,
      fourStarWeapon,
      threeStar,
      secondThreeStar,
    ]);
  });
});
