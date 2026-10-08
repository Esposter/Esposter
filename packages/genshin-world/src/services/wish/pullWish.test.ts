import type { Banner } from "#src/models/wish/Banner";
import type { WishItem } from "#src/models/wish/WishItem";
import type { WishPity } from "#src/models/wish/WishPity";

import { WishItemKind } from "#src/models/wish/WishItemKind";
import { BEGINNERS_GUARANTEED_WISH } from "#src/services/wish/constants";
import { pullWish } from "#src/services/wish/pullWish";
import { BannerKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createRandom = (values: number[]): (() => number) => {
  let index = 0;
  return () => values[index++] ?? 0;
};
const createItem = (id: number, kind: WishItemKind, rarity: number): WishItem => ({ id, kind, rarity });

describe(pullWish, () => {
  const fiveStar = createItem(0, WishItemKind.Character, 5);
  const featuredFourStar = createItem(1, WishItemKind.Character, 4);
  const fourStar = createItem(2, WishItemKind.Weapon, 4);
  const threeStar = createItem(3, WishItemKind.Weapon, 3);
  const createBanner = (kind: BannerKind): Banner => ({
    featuredFiveStars: [fiveStar],
    featuredFourStars: [featuredFourStar],
    fiveStars: [fiveStar],
    fourStars: [fourStar],
    kind,
    threeStars: [threeStar],
  });
  const pity: WishPity = {
    fatePoints: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    isFiveStarGuaranteed: false,
    isFourStarGuaranteed: false,
    lossCount: 0,
    wishCount: 0,
  };

  test("draws a three-star above both rates, counting the wish toward each", () => {
    expect.hasAssertions();

    expect(pullWish(createBanner(BannerKind.Standard), pity, createRandom([0.99]))).toStrictEqual({
      pity: { ...pity, fiveStarCount: 1, fourStarCount: 1, wishCount: 1 },
      result: { isCapturingRadiance: false, item: threeStar },
    });
  });

  test.each([
    [0.065, fiveStar],
    [0.067, fourStar],
  ])("climbs the five-star rate from the 74th wish, drawing at %s", (roll, item) => {
    expect.hasAssertions();

    expect(
      pullWish(createBanner(BannerKind.Standard), { ...pity, fiveStarCount: 73 }, createRandom([roll])).result.item,
    ).toBe(item);
  });

  test("draws a five-star at hard pity and passes the four-star guarantee on to the next wish", () => {
    expect.hasAssertions();

    const banner = createBanner(BannerKind.Standard);
    const random = createRandom([0.99, 0, 0, 0.99]);
    const fiveStarPull = pullWish(banner, { ...pity, fiveStarCount: 89, fourStarCount: 9 }, random);

    expect(fiveStarPull.result.item).toBe(fiveStar);
    expect(pullWish(banner, fiveStarPull.pity, random).result.item).toBe(fourStar);
  });

  test("guarantees a featured four-star after a miss", () => {
    expect.hasAssertions();

    const banner = createBanner(BannerKind.CharacterEvent);
    const { pity: missedPity, result } = pullWish(banner, { ...pity, fourStarCount: 9 }, createRandom([0.5, 0.99]));

    expect(result.item).toBe(fourStar);
    expect(missedPity.isFourStarGuaranteed).toBe(true);
    expect(pullWish(banner, { ...missedPity, fourStarCount: 9 }, createRandom([0.5])).result.item).toBe(
      featuredFourStar,
    );
  });

  test("draws the beginners' featured four-star on its eighth wish", () => {
    expect.hasAssertions();

    expect(
      pullWish(
        createBanner(BannerKind.Beginners),
        { ...pity, wishCount: BEGINNERS_GUARANTEED_WISH - 1 },
        createRandom([0.99]),
      ).result.item,
    ).toBe(featuredFourStar);
  });
});
