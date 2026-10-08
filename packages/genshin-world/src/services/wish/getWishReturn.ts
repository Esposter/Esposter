import type { CurrencyAmount } from "#src/models/inventory/CurrencyAmount";
import type { WishItem } from "#src/models/wish/WishItem";

import { Currency } from "#src/models/inventory/Currency";
import { WishItemKind } from "#src/models/wish/WishItemKind";
import {
  CONSTELLATION_COUNT,
  FIVE_STAR_COMPLETE_STARGLITTER,
  FIVE_STAR_DUPLICATE_STARGLITTER,
  FIVE_STAR_WEAPON_STARGLITTER,
  FOUR_STAR_COMPLETE_STARGLITTER,
  FOUR_STAR_DUPLICATE_STARGLITTER,
  FOUR_STAR_WEAPON_STARGLITTER,
  THREE_STAR_WEAPON_STARDUST,
} from "#src/services/wish/constants";

// What a wish's item returns beside itself, given how many of it the player already holds. A new character returns
// Nothing, and a duplicate Masterless Starglitter beside the Stella Fortuna that completes a constellation, more once
// All six are complete. A weapon returns Starglitter, or Masterless Stardust at three stars
export const getWishReturn = ({ kind, rarity }: WishItem, heldCount: number): CurrencyAmount | undefined => {
  const isFiveStar = rarity === 5;
  if (kind === WishItemKind.Weapon)
    return rarity === 3
      ? { currency: Currency.MasterlessStardust, quantity: THREE_STAR_WEAPON_STARDUST }
      : {
          currency: Currency.MasterlessStarglitter,
          quantity: isFiveStar ? FIVE_STAR_WEAPON_STARGLITTER : FOUR_STAR_WEAPON_STARGLITTER,
        };
  else if (heldCount === 0) return undefined;
  else if (heldCount <= CONSTELLATION_COUNT)
    return {
      currency: Currency.MasterlessStarglitter,
      quantity: isFiveStar ? FIVE_STAR_DUPLICATE_STARGLITTER : FOUR_STAR_DUPLICATE_STARGLITTER,
    };
  else
    return {
      currency: Currency.MasterlessStarglitter,
      quantity: isFiveStar ? FIVE_STAR_COMPLETE_STARGLITTER : FOUR_STAR_COMPLETE_STARGLITTER,
    };
};
