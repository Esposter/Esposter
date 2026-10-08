import type { Banner } from "#src/models/wish/Banner";
import type { WishItem } from "#src/models/wish/WishItem";
import type { WishPity } from "#src/models/wish/WishPity";
import type { WishPull } from "#src/models/wish/WishPull";

import { BannerKindWishRatesMap } from "#src/services/wish/BannerKindWishRatesMap";
import { CAPTURING_RADIANCE_LOSS_LIMIT, CAPTURING_RADIANCE_RATE, FATE_POINT_LIMIT } from "#src/services/wish/constants";
import { pickWishItem } from "#src/services/wish/pickWishItem";
import { takeOne } from "@esposter/shared";
import { BannerKind } from "genshin-interface";

// Which five-star a wish draws, by its banner's kind. On the character event wish a guarantee draws the promotional
// Character, else Capturing Radiance may, else the 50/50 does, and a loss draws any other five-star and guarantees the
// Next. On the weapon wish a Fate Point draws the charted weapon, else a guarantee or the featured share draws either
// Promotional weapon, and any other guarantees the next; a five-star that is not the charted weapon earns a Fate Point.
// Every other wish draws any five-star of its pool
export const pullFiveStar = (banner: Banner, pity: WishPity, random: () => number): WishPull => {
  const { featuredFiveStarShare } = BannerKindWishRatesMap[banner.kind];
  if (banner.kind === BannerKind.CharacterEvent) {
    const promotional = takeOne(banner.featuredFiveStars);
    if (pity.isFiveStarGuaranteed)
      return {
        pity: { ...pity, isFiveStarGuaranteed: false },
        result: { isCapturingRadiance: false, item: promotional },
      };

    const isCapturingRadiance = pity.lossCount >= CAPTURING_RADIANCE_LOSS_LIMIT || random() < CAPTURING_RADIANCE_RATE;
    if (isCapturingRadiance || random() < featuredFiveStarShare)
      return { pity: { ...pity, lossCount: 0 }, result: { isCapturingRadiance, item: promotional } };
    else
      return {
        pity: { ...pity, isFiveStarGuaranteed: true, lossCount: pity.lossCount + 1 },
        result: { isCapturingRadiance: false, item: pickWishItem(banner.fiveStars, random) },
      };
  } else if (banner.kind === BannerKind.WeaponEvent) {
    const chartedWeapon = banner.featuredFiveStars.find(({ id }) => id === pity.chartedWeaponId);
    let item: WishItem;
    if (chartedWeapon && pity.fatePoints >= FATE_POINT_LIMIT) item = chartedWeapon;
    else if (pity.isFiveStarGuaranteed || random() < featuredFiveStarShare)
      item = takeOne(banner.featuredFiveStars, Math.floor(random() * banner.featuredFiveStars.length));
    else item = pickWishItem(banner.fiveStars, random);
    return {
      pity: {
        ...pity,
        fatePoints: !chartedWeapon || item === chartedWeapon ? 0 : Math.min(pity.fatePoints + 1, FATE_POINT_LIMIT),
        isFiveStarGuaranteed: !banner.featuredFiveStars.includes(item),
      },
      result: { isCapturingRadiance: false, item },
    };
  } else return { pity, result: { isCapturingRadiance: false, item: pickWishItem(banner.fiveStars, random) } };
};
