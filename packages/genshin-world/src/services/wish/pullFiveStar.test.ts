import type { Banner } from "#src/models/wish/Banner";
import type { WishItem } from "#src/models/wish/WishItem";
import type { WishPity } from "#src/models/wish/WishPity";

import { WishItemKind } from "#src/models/wish/WishItemKind";
import { CAPTURING_RADIANCE_LOSS_LIMIT, FATE_POINT_LIMIT } from "#src/services/wish/constants";
import { pullFiveStar } from "#src/services/wish/pullFiveStar";
import { BannerKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createRandom = (values: number[]): (() => number) => {
  let index = 0;
  return () => values[index++] ?? 0;
};
const createItem = (id: number, kind: WishItemKind): WishItem => ({ id, kind, name: "", rarity: 5 });

describe(pullFiveStar, () => {
  const pity: WishPity = {
    fatePoints: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    isFiveStarGuaranteed: false,
    isFourStarGuaranteed: false,
    lossCount: 0,
    wishCount: 0,
  };
  const promotional = createItem(0, WishItemKind.Character);
  const standardCharacter = createItem(1, WishItemKind.Character);
  const characterBanner: Banner = {
    featuredFiveStars: [promotional],
    featuredFourStars: [],
    fiveStars: [standardCharacter],
    fourStars: [],
    kind: BannerKind.CharacterEvent,
    threeStars: [],
  };
  const chartedWeapon = createItem(2, WishItemKind.Weapon);
  const otherWeapon = createItem(3, WishItemKind.Weapon);
  const standardWeapon = createItem(4, WishItemKind.Weapon);
  const weaponBanner: Banner = {
    featuredFiveStars: [chartedWeapon, otherWeapon],
    featuredFourStars: [],
    fiveStars: [standardWeapon],
    fourStars: [],
    kind: BannerKind.WeaponEvent,
    threeStars: [],
  };
  const chartedPity: WishPity = { ...pity, chartedWeaponId: chartedWeapon.id };

  test("draws the promotional character on a guarantee", () => {
    expect.hasAssertions();

    expect(pullFiveStar(characterBanner, { ...pity, isFiveStarGuaranteed: true }, createRandom([0.99]))).toStrictEqual({
      pity,
      result: { isCapturingRadiance: false, item: promotional },
    });
  });

  test("loses the 50/50 to another five-star and guarantees the next", () => {
    expect.hasAssertions();

    expect(pullFiveStar(characterBanner, pity, createRandom([0.99, 0.99]))).toStrictEqual({
      pity: { ...pity, isFiveStarGuaranteed: true, lossCount: 1 },
      result: { isCapturingRadiance: false, item: standardCharacter },
    });
  });

  test.each([
    [0, 0],
    [0.99, CAPTURING_RADIANCE_LOSS_LIMIT],
  ])("captures radiance at %s after %s losses running", (roll, lossCount) => {
    expect.hasAssertions();

    expect(pullFiveStar(characterBanner, { ...pity, lossCount }, createRandom([roll, 0.99]))).toStrictEqual({
      pity,
      result: { isCapturingRadiance: true, item: promotional },
    });
  });

  test("draws the charted weapon on a Fate Point", () => {
    expect.hasAssertions();

    expect(
      pullFiveStar(weaponBanner, { ...chartedPity, fatePoints: FATE_POINT_LIMIT }, createRandom([0.99])),
    ).toStrictEqual({ pity: chartedPity, result: { isCapturingRadiance: false, item: chartedWeapon } });
  });

  test("earns a Fate Point for the other promotional weapon", () => {
    expect.hasAssertions();

    expect(pullFiveStar(weaponBanner, chartedPity, createRandom([0, 0.99]))).toStrictEqual({
      pity: { ...chartedPity, fatePoints: 1 },
      result: { isCapturingRadiance: false, item: otherWeapon },
    });
  });

  test("earns a Fate Point and a guarantee for a standard weapon", () => {
    expect.hasAssertions();

    expect(pullFiveStar(weaponBanner, chartedPity, createRandom([0.99]))).toStrictEqual({
      pity: { ...chartedPity, fatePoints: 1, isFiveStarGuaranteed: true },
      result: { isCapturingRadiance: false, item: standardWeapon },
    });
  });
});
