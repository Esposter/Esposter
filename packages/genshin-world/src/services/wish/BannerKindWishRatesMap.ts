import type { WishRates } from "#src/models/wish/WishRates";

import {
  WEAPON_WISH_FIVE_STAR_RATE,
  WEAPON_WISH_FOUR_STAR_RATE,
  WISH_FIVE_STAR_RATE,
  WISH_FOUR_STAR_RATE,
} from "#src/services/wish/constants";
import { BannerKind } from "genshin-interface";

// Each kind of wish's rates, and the share of a five-star and a four-star that is featured: half on the character event
// Wish, three quarters on the weapon wish, and none where nothing is
export const BannerKindWishRatesMap: Record<BannerKind, WishRates> = {
  [BannerKind.Beginners]: {
    featuredFiveStarShare: 0,
    featuredFourStarShare: 0,
    fiveStar: WISH_FIVE_STAR_RATE,
    fourStar: WISH_FOUR_STAR_RATE,
  },
  [BannerKind.CharacterEvent]: {
    featuredFiveStarShare: 0.5,
    featuredFourStarShare: 0.5,
    fiveStar: WISH_FIVE_STAR_RATE,
    fourStar: WISH_FOUR_STAR_RATE,
  },
  [BannerKind.Standard]: {
    featuredFiveStarShare: 0,
    featuredFourStarShare: 0,
    fiveStar: WISH_FIVE_STAR_RATE,
    fourStar: WISH_FOUR_STAR_RATE,
  },
  [BannerKind.WeaponEvent]: {
    featuredFiveStarShare: 0.75,
    featuredFourStarShare: 0.75,
    fiveStar: WEAPON_WISH_FIVE_STAR_RATE,
    fourStar: WEAPON_WISH_FOUR_STAR_RATE,
  },
};
