import type { Wallet } from "#src/models/inventory/Wallet";
import type { Banner } from "#src/models/wish/Banner";
import type { WishPity } from "#src/models/wish/WishPity";

import { Currency } from "#src/models/inventory/Currency";
import { WishItemKind } from "#src/models/wish/WishItemKind";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import {
  BEGINNERS_WISH_LIMIT,
  FIVE_STAR_COMPLETE_STARGLITTER,
  FIVE_STAR_DUPLICATE_STARGLITTER,
} from "#src/services/wish/constants";
import { makeWishes } from "#src/services/wish/makeWishes";
import { BannerKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

// Every number under the five-star rate, so each wish draws the pool's one character
const random = (): number => 0;

describe(makeWishes, () => {
  const character = { id: 0, kind: WishItemKind.Character, name: "", rarity: 5 };
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
  const wallet: Wallet = { ...EMPTY_WALLET };

  test("spends its Fates and returns Starglitter for a character drawn twice in one set", () => {
    expect.hasAssertions();

    expect(
      makeWishes(
        { banner, count: 2, heldCountMap: new Map(), pity, wallet: { ...wallet, [Currency.AcquaintFate]: 2 } },
        random,
      ),
    ).toStrictEqual({
      heldCountMap: new Map([[character.id, 2]]),
      pity: { ...pity, fourStarCount: 2, wishCount: 2 },
      results: [
        { isCapturingRadiance: false, item: character },
        {
          isCapturingRadiance: false,
          item: character,
          wishReturn: { currency: Currency.MasterlessStarglitter, quantity: FIVE_STAR_DUPLICATE_STARGLITTER },
        },
      ],
      stellaFortunaCountMap: new Map([[character.id, 1]]),
      wallet: { ...wallet, [Currency.MasterlessStarglitter]: FIVE_STAR_DUPLICATE_STARGLITTER },
    });
  });

  test("counts a duplicate's Stella Fortuna to its character, and a five-star past six copies' Masterless one to the wallet", () => {
    expect.hasAssertions();

    expect(
      makeWishes(
        {
          banner,
          count: 1,
          heldCountMap: new Map([[character.id, 7]]),
          pity,
          wallet: { ...wallet, [Currency.AcquaintFate]: 1 },
        },
        random,
      ),
    ).toStrictEqual({
      heldCountMap: new Map([[character.id, 8]]),
      pity: { ...pity, fourStarCount: 1, wishCount: 1 },
      results: [
        {
          isCapturingRadiance: false,
          item: character,
          wishReturn: { currency: Currency.MasterlessStarglitter, quantity: FIVE_STAR_COMPLETE_STARGLITTER },
        },
      ],
      stellaFortunaCountMap: new Map(),
      wallet: {
        ...wallet,
        [Currency.MasterlessStarglitter]: FIVE_STAR_COMPLETE_STARGLITTER,
        [Currency.MasterlessStellaFortuna]: 1,
      },
    });
  });

  test("refuses a set the wallet cannot pay for", () => {
    expect.hasAssertions();

    expect(() =>
      makeWishes({ banner, count: 1, heldCountMap: new Map(), pity, wallet }, random),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: makeWishes, 1 wishes are not on offer]`,
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
      `[InvalidOperationError: Invalid operation: Update, name: makeWishes, 1 wishes are not on offer]`,
    );
  });
});
