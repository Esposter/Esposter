import type { Wallet } from "#src/models/inventory/Wallet";
import type { Wishes } from "#src/models/wish/Wishes";
import type { WishRequest } from "#src/models/wish/WishRequest";
import type { WishResult } from "#src/models/wish/WishResult";

import { Currency } from "#src/models/inventory/Currency";
import { WishItemKind } from "#src/models/wish/WishItemKind";
import { checkIsWishSetOffered } from "#src/services/wish/checkIsWishSetOffered";
import { CONSTELLATION_COUNT } from "#src/services/wish/constants";
import { getWishCost } from "#src/services/wish/getWishCost";
import { getWishReturn } from "#src/services/wish/getWishReturn";
import { pullWish } from "#src/services/wish/pullWish";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A wish ×1 or ×10: its Fates spent from the wallet, each wish pulled in turn, and what each returns added back, a
// Character drawn twice in one set held by the second, and its Stella Fortuna counted to it. A set not on offer is
// Refused, so a screen offers only the sets it can make
export const makeWishes = (
  { banner, count, heldCountMap, pity, wallet }: WishRequest,
  random: () => number,
): Wishes => {
  if (!checkIsWishSetOffered(banner.kind, pity, wallet, count))
    throw new InvalidOperationError(Operation.Update, makeWishes.name, `${count} wishes are not on offer`);

  const cost = getWishCost(banner.kind, count);

  const nextHeldCountMap = new Map(heldCountMap);
  const nextStellaFortunaCountMap = new Map<number, number>();
  const nextWallet: Wallet = { ...wallet, [cost.currency]: wallet[cost.currency] - cost.quantity };
  const results: WishResult[] = [];
  let nextPity = pity;
  for (let index = 0; index < count; index++) {
    const pull = pullWish(banner, nextPity, random);
    const { item } = pull.result;
    const heldCount = nextHeldCountMap.get(item.id) ?? 0;
    const wishReturn = getWishReturn(item, heldCount);
    if (item.kind === WishItemKind.Character) {
      nextHeldCountMap.set(item.id, heldCount + 1);
      // A duplicate among the first six brings its character's own Stella Fortuna; a five-star past them, a Masterless one
      if (heldCount > 0 && heldCount <= CONSTELLATION_COUNT)
        nextStellaFortunaCountMap.set(item.id, (nextStellaFortunaCountMap.get(item.id) ?? 0) + 1);
      else if (item.rarity === 5 && heldCount > CONSTELLATION_COUNT) nextWallet[Currency.MasterlessStellaFortuna] += 1;
    }
    if (wishReturn) nextWallet[wishReturn.currency] += wishReturn.quantity;
    results.push(wishReturn ? { ...pull.result, wishReturn } : pull.result);
    nextPity = pull.pity;
  }

  return {
    heldCountMap: nextHeldCountMap,
    pity: nextPity,
    results,
    stellaFortunaCountMap: nextStellaFortunaCountMap,
    wallet: nextWallet,
  };
};
