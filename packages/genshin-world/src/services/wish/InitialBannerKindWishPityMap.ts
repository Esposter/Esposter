import type { WishPity } from "#src/models/wish/WishPity";

import { INITIAL_WISH_PITY } from "#src/services/wish/constants";
import { BannerKind } from "genshin-interface";

// Each kind of wish's counters before its first wish
export const InitialBannerKindWishPityMap: Readonly<Record<BannerKind, Readonly<WishPity>>> = {
  [BannerKind.Beginners]: INITIAL_WISH_PITY,
  [BannerKind.CharacterEvent]: INITIAL_WISH_PITY,
  [BannerKind.Standard]: INITIAL_WISH_PITY,
  [BannerKind.WeaponEvent]: INITIAL_WISH_PITY,
};
