import type { Trial } from "#src/models/trial/Trial";

import { WishItemKind } from "#src/models/wish/WishItemKind";
import { findBannerTrial } from "#src/services/trial/findBannerTrial";
import { describe, expect, test } from "vitest";

const TRIALS: Trial[] = [
  { characterId: 10_000_021, level: 5, trialId: 1 },
  { characterId: 10_000_015, level: 5, trialId: 2 },
];
const CHARACTER_ITEM = { id: 10_000_015, kind: WishItemKind.Character, name: "", rarity: 5 };
const WEAPON_ITEM = { id: 11_501, kind: WishItemKind.Weapon, name: "", rarity: 5 };

describe(findBannerTrial, () => {
  test("a banner offers the trial of its featured character", () => {
    expect.hasAssertions();
    expect(findBannerTrial(TRIALS, [CHARACTER_ITEM])).toStrictEqual(TRIALS[1]);
  });

  test("a banner with no trial offers none", () => {
    expect.hasAssertions();
    expect(findBannerTrial(TRIALS, [WEAPON_ITEM])).toBeUndefined();
  });
});
