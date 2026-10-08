import type { Wallet } from "#src/models/inventory/Wallet";
import type { Banner } from "#src/models/wish/Banner";
import type { WishPity } from "#src/models/wish/WishPity";

import { Currency } from "#src/models/inventory/Currency";
import { WishItemKind } from "#src/models/wish/WishItemKind";
import { BEGINNERS_WISH_LIMIT, FIVE_STAR_DUPLICATE_STARGLITTER } from "#src/services/wish/constants";
import { makeWishes } from "#src/services/wish/makeWishes";
import { BannerKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

// Every number under the five-star rate, so each wish draws the pool's one character
const random = (): number => 0;

describe(makeWishes, () => {
  const character = { id: 0, kind: WishItemKind.Character, rarity: 5 };
  const banner: Banner = {
    featuredFiveStars: [],
    featuredFourStars: [],
    fiveStars: [character],
    fourStars: [],
    kind: BannerKind.Standard,
    threeStars: [],
  };
  const pity: WishPity = {
    fatePoints: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    isFiveStarGuaranteed: false,
    isFourStarGuaranteed: false,
    lossCount: 0,
    wishCount: 0,
  };
  const wallet: Wallet = {
    [Currency.AcquaintFate]: 0,
    [Currency.GenesisCrystal]: 0,
    [Currency.IntertwinedFate]: 0,
    [Currency.MasterlessStardust]: 0,
    [Currency.MasterlessStarglitter]: 0,
    [Currency.Mora]: 0,
    [Currency.Primogem]: 0,
  };

  test("spends its Fates and returns Starglitter for a character drawn twice in one set", () => {
    expect.hasAssertions();

    expect(
      makeWishes(
        { banner, count: 2, heldCountMap: new Map(), pity, wallet: { ...wallet, [Currency.AcquaintFate]: 2 } },
        random,
      ),
    ).toStrictEqual({
      pity: { ...pity, fourStarCount: 2, wishCount: 2 },
      results: [
        { isCapturingRadiance: false, item: character },
        {
          isCapturingRadiance: false,
          item: character,
          wishReturn: { currency: Currency.MasterlessStarglitter, quantity: FIVE_STAR_DUPLICATE_STARGLITTER },
        },
      ],
      wallet: { ...wallet, [Currency.MasterlessStarglitter]: FIVE_STAR_DUPLICATE_STARGLITTER },
    });
  });

  test("refuses a set the wallet cannot pay for", () => {
    expect.hasAssertions();

    expect(() =>
      makeWishes({ banner, count: 1, heldCountMap: new Map(), pity, wallet }, random),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: makeWishes, 1 AcquaintFate are needed]`,
    );
  });

  test("refuses a wish past the beginners' twentieth", () => {
    expect.hasAssertions();

    expect(() =>
      makeWishes(
        {
          banner: { ...banner, kind: BannerKind.Beginners },
          count: 1,
          heldCountMap: new Map(),
          pity: { ...pity, wishCount: BEGINNERS_WISH_LIMIT },
          wallet: { ...wallet, [Currency.AcquaintFate]: 1 },
        },
        random,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: makeWishes, 20 wishes at most]`,
    );
  });
});
