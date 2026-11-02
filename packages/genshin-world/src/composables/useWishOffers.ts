import type { Wallet } from "#src/models/inventory/Wallet";
import type { WishPity } from "#src/models/wish/WishPity";
import type { BannerKind } from "genshin-interface";
import type { GameText } from "genshin-text";
import type { ComputedRef, Ref } from "vue";

import { Currency } from "#src/models/inventory/Currency";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { BannerKindFateMap } from "#src/services/wish/BannerKindFateMap";
import { checkIsWishSetOffered } from "#src/services/wish/checkIsWishSetOffered";
import { FATE_PRIMOGEM_COST, TEN_WISH_COUNT } from "#src/services/wish/constants";
import { getWishCost } from "#src/services/wish/getWishCost";
import { fillGameTextValues, GameTextKey } from "genshin-text";
import { computed } from "vue";

interface WishOffersSource {
  // The open banner's kind, whose Fate is bought and whose draws are offered
  bannerKind: ComputedRef<BannerKind | undefined>;
  // The game's words in the reader's language
  getGameText: () => GameText;
  // Each kind's counters, which the beginners' wish and the offers read
  pityMap: Ref<Readonly<Record<BannerKind, WishPity>>>;
  // The count text of an amount of a currency, in the reader's language
  toCountText: (currency: Currency, quantity: number) => string;
  // The Fates and the Primogems the wallet holds, which every offer is affordable from
  wallet: Ref<Wallet>;
}

// The open banner's offers and the wallet they are paid from: its ×1 and ×10 sets, the Fate bought with Primogems once the
// wallet holds too few Fates for its ×1, and the currencies the screen shows beside them
export const useWishOffers = ({ bannerKind, getGameText, pityMap, toCountText, wallet }: WishOffersSource) => {
  // The open banner's ×1 and ×10, each offered while the wallet holds its Fates and the beginners' wish has room for it
  const sets = computed(() => {
    const kind = bannerKind.value;
    if (!kind) return [];
    return [1, TEN_WISH_COUNT].map((count) => {
      const { quantity } = getWishCost(kind, count);
      return {
        // The set's Fates are drawn as the game draws them, by their icon and count alone
        cost: `×${quantity}`,
        count,
        isAffordable: checkIsWishSetOffered(kind, pityMap.value[kind], wallet.value, count),
        label: fillGameTextValues(getGameText()[GameTextKey.WishCount], count),
      };
    });
  });
  // The open banner's Fate bought with Primogems once the wallet holds too few Fates for its ×1, the game's direct purchase
  const purchases = computed(() => {
    const kind = bannerKind.value;
    if (!kind) return [];
    const fate = BannerKindFateMap[kind];
    if (wallet.value[fate] >= getWishCost(kind, 1).quantity) return [];
    const text = getGameText();
    return [
      {
        cost: toCountText(Currency.Primogem, FATE_PRIMOGEM_COST),
        isAffordable: wallet.value[Currency.Primogem] >= FATE_PRIMOGEM_COST,
        label: fillGameTextValues(text[GameTextKey.WishBuyFate], text[CurrencyGameTextKeyMap[fate]]),
      },
    ];
  });
  // The Primogems at the head, and at the foot the open banner's Fate beside the Genesis Crystals the game counts there too
  const currencies = computed(() => {
    const text = getGameText();
    return [
      Currency.Primogem,
      ...(bannerKind.value ? [BannerKindFateMap[bannerKind.value]] : []),
      Currency.GenesisCrystal,
    ].map((currency) => ({
      id: currency,
      isTopUp: currency === Currency.Primogem,
      name: text[CurrencyGameTextKeyMap[currency]],
      quantity: wallet.value[currency],
    }));
  });
  return { currencies, purchases, sets };
};
