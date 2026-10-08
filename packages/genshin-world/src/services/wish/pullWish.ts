import type { Banner } from "#src/models/wish/Banner";
import type { RarityRate } from "#src/models/wish/RarityRate";
import type { WishPity } from "#src/models/wish/WishPity";
import type { WishPull } from "#src/models/wish/WishPull";

import { BannerKindWishRatesMap } from "#src/services/wish/BannerKindWishRatesMap";
import { BEGINNERS_GUARANTEED_WISH } from "#src/services/wish/constants";
import { pickWishItem } from "#src/services/wish/pickWishItem";
import { pullFiveStar } from "#src/services/wish/pullFiveStar";
import { takeOne } from "@esposter/shared";
import { BannerKind } from "genshin-interface";

// A rarity's rate on the given wish since the last of it: its base until soft pity, a step higher each wish from there,
// And certain at hard pity
const computeRarityRate = ({ base, hardPity, softPityStart, softPityStep }: RarityRate, wishNumber: number): number =>
  wishNumber >= hardPity ? 1 : Math.min(base + Math.max(wishNumber - softPityStart + 1, 0) * softPityStep, 1);

// One wish on a banner, drawn from one number of the random source: under the five-star rate a five-star, under that
// And the four-star rate a four-star, the four-star's rate capped so the two fill every number at its guarantee, and a
// Three-star weapon otherwise. A five-star leaves the four-star counter running, so its guarantee passes to the next
// Wish. A four-star is a featured one by the banner's share or a guarantee, a miss guaranteeing the next, and the
// Beginners' wish's eighth is its featured four-star
export const pullWish = (banner: Banner, pity: WishPity, random: () => number): WishPull => {
  const { featuredFourStarShare, fiveStar, fourStar } = BannerKindWishRatesMap[banner.kind];
  const wishCount = pity.wishCount + 1;
  const fiveStarCount = pity.fiveStarCount + 1;
  const fourStarCount = pity.fourStarCount + 1;
  if (banner.kind === BannerKind.Beginners && wishCount === BEGINNERS_GUARANTEED_WISH)
    return {
      pity: { ...pity, fiveStarCount, fourStarCount: 0, wishCount },
      result: { isCapturingRadiance: false, item: takeOne(banner.featuredFourStars) },
    };

  const fiveStarRate = computeRarityRate(fiveStar, fiveStarCount);
  const fourStarRate = Math.min(computeRarityRate(fourStar, fourStarCount), 1 - fiveStarRate);
  const roll = random();
  if (roll < fiveStarRate) return pullFiveStar(banner, { ...pity, fiveStarCount: 0, fourStarCount, wishCount }, random);
  else if (roll < fiveStarRate + fourStarRate) {
    const isFeatured = pity.isFourStarGuaranteed || random() < featuredFourStarShare;
    const item = isFeatured
      ? takeOne(banner.featuredFourStars, Math.floor(random() * banner.featuredFourStars.length))
      : pickWishItem(banner.fourStars, random);
    return {
      pity: {
        ...pity,
        fiveStarCount,
        fourStarCount: 0,
        isFourStarGuaranteed: !isFeatured && featuredFourStarShare > 0,
        wishCount,
      },
      result: { isCapturingRadiance: false, item },
    };
  } else
    return {
      pity: { ...pity, fiveStarCount, fourStarCount, wishCount },
      result: { isCapturingRadiance: false, item: pickWishItem(banner.threeStars, random) },
    };
};
