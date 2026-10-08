import type { CurrencyAmount } from "#src/models/inventory/CurrencyAmount";

import { BannerKindFateMap } from "#src/services/wish/BannerKindFateMap";
import { BEGINNERS_TEN_WISH_COST, TEN_WISH_COUNT } from "#src/services/wish/constants";
import { BannerKind } from "genshin-interface";

// What a set of wishes costs: a Fate of its kind each, but eight for the beginners' ten
export const getWishCost = (bannerKind: BannerKind, count: number): CurrencyAmount => ({
  currency: BannerKindFateMap[bannerKind],
  quantity: bannerKind === BannerKind.Beginners && count === TEN_WISH_COUNT ? BEGINNERS_TEN_WISH_COST : count,
});
