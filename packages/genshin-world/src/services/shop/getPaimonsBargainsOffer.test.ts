import type { PaimonsBargainsRotation } from "#src/models/shop/PaimonsBargainsRotation";

import { getPaimonsBargainsOffer } from "#src/services/shop/getPaimonsBargainsOffer";
import { describe, expect, test } from "vitest";

// The middle of a game-time month, in each of the twelve months of one year
const monthInstant = (month: number): Temporal.Instant =>
  Temporal.ZonedDateTime.from({ day: 15, month, timeZone: "+08:00", year: 2026 }).toInstant();

describe(getPaimonsBargainsOffer, () => {
  const rotation: PaimonsBargainsRotation = {
    blackcliffWeaponIds: [11_408, 12_408, 13_404, 14_408, 15_408],
    characterPairs: [
      [10_000_020, 10_000_021],
      [10_000_032, 10_000_006],
      [10_000_014, 10_000_015],
      [10_000_031, 10_000_023],
      [10_000_024, 10_000_034],
      [10_000_027, 10_000_025],
    ],
    royalWeaponIds: [11_404, 12_404, 13_408, 14_404, 15_404],
  };

  test("two characters are offered each month", () => {
    expect.hasAssertions();
    const offers = Array.from({ length: 12 }, (_value, index) =>
      getPaimonsBargainsOffer(rotation, monthInstant(index + 1)),
    );
    for (const { characterIds } of offers) expect(characterIds).toHaveLength(2);
    // January is Fischl and Xiangling, the fourth pair, and the six pairs come round again after six months
    expect(offers.at(0)?.characterIds).toStrictEqual(rotation.characterPairs.at(3));
    expect(offers.slice(6).map(({ characterIds }) => characterIds)).toStrictEqual(
      offers.slice(0, 6).map(({ characterIds }) => characterIds),
    );
  });

  test("the weapon set alternates between Blackcliff and Royal each month", () => {
    expect.hasAssertions();
    // Blackcliff in the odd months and Royal in the even ones, the wiki's rotation
    expect(getPaimonsBargainsOffer(rotation, monthInstant(1)).weaponIds).toStrictEqual(rotation.blackcliffWeaponIds);
    expect(getPaimonsBargainsOffer(rotation, monthInstant(2)).weaponIds).toStrictEqual(rotation.royalWeaponIds);
  });
});
