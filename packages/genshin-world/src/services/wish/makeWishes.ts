import type { Wallet } from "#src/models/inventory/Wallet";
import type { Wishes } from "#src/models/wish/Wishes";
import type { WishRequest } from "#src/models/wish/WishRequest";
import type { WishResult } from "#src/models/wish/WishResult";

import { WishItemKind } from "#src/models/wish/WishItemKind";
import { BEGINNERS_WISH_LIMIT } from "#src/services/wish/constants";
import { getWishCost } from "#src/services/wish/getWishCost";
import { getWishReturn } from "#src/services/wish/getWishReturn";
import { pullWish } from "#src/services/wish/pullWish";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { BannerKind } from "genshin-interface";

// A wish ×1 or ×10: its Fates spent from the wallet, each wish pulled in turn, and what each returns added back, a
// Character drawn twice in one set held by the second. A set the wallet cannot pay for, or past the beginners' wish's
// Twentieth wish, is refused, so a screen offers only the sets it can make
export const makeWishes = (
  { banner, count, heldCountMap, pity, wallet }: WishRequest,
  random: () => number,
): Wishes => {
  const cost = getWishCost(banner.kind, count);
  if (wallet[cost.currency] < cost.quantity)
    throw new InvalidOperationError(Operation.Update, makeWishes.name, `${cost.quantity} ${cost.currency} are needed`);
  else if (banner.kind === BannerKind.Beginners && pity.wishCount + count > BEGINNERS_WISH_LIMIT)
    throw new InvalidOperationError(Operation.Update, makeWishes.name, `${BEGINNERS_WISH_LIMIT} wishes at most`);

  const nextHeldCountMap = new Map(heldCountMap);
  const nextWallet: Wallet = { ...wallet, [cost.currency]: wallet[cost.currency] - cost.quantity };
  const results: WishResult[] = [];
  let nextPity = pity;
  for (let index = 0; index < count; index++) {
    const pull = pullWish(banner, nextPity, random);
    const { item } = pull.result;
    const heldCount = nextHeldCountMap.get(item.id) ?? 0;
    const wishReturn = getWishReturn(item, heldCount);
    if (item.kind === WishItemKind.Character) nextHeldCountMap.set(item.id, heldCount + 1);
    if (wishReturn) nextWallet[wishReturn.currency] += wishReturn.quantity;
    results.push(wishReturn ? { ...pull.result, wishReturn } : pull.result);
    nextPity = pull.pity;
  }

  return { pity: nextPity, results, wallet: nextWallet };
};
