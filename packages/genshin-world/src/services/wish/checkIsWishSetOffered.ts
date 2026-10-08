import type { Wallet } from "#src/models/inventory/Wallet";
import type { WishPity } from "#src/models/wish/WishPity";

import { BEGINNERS_WISH_LIMIT } from "#src/services/wish/constants";
import { getWishCost } from "#src/services/wish/getWishCost";
import { BannerKind } from "genshin-interface";

// Whether a set of wishes can be made: the wallet holds its Fates, and on the beginners' wish it stays within the
// Twenty wishes the banner offers
export const checkIsWishSetOffered = (
  bannerKind: BannerKind,
  pity: WishPity,
  wallet: Wallet,
  count: number,
): boolean => {
  const { currency, quantity } = getWishCost(bannerKind, count);
  return (
    wallet[currency] >= quantity &&
    (bannerKind !== BannerKind.Beginners || pity.wishCount + count <= BEGINNERS_WISH_LIMIT)
  );
};
