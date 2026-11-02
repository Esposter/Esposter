import type { WishPity } from "#src/models/wish/WishPity";
import type { GameText } from "genshin-text";
import type { ComputedRef, Ref } from "vue";

import { FATE_POINT_LIMIT } from "#src/services/wish/constants";
import { BannerKind } from "genshin-interface";
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";
import { computed } from "vue";

interface WishEpitomizedPathSource {
  // The open banner's kind, which the weapon wish's path is shown on
  bannerKind: ComputedRef<BannerKind | undefined>;
  // The game's words in the reader's language
  getGameText: () => GameText;
  // Each kind's counters, whose weapon wish's Fate Points toward its charted weapon the path shows
  pityMap: Ref<Readonly<Record<BannerKind, WishPity>>>;
}

// The Epitomized Path of the weapon wish: whether the open banner is one, and its Fate Points in the game's words and colours
export const useWishEpitomizedPath = ({ bannerKind, getGameText, pityMap }: WishEpitomizedPathSource) => {
  const isWeaponWish = computed(() => bannerKind.value === BannerKind.WeaponEvent);
  const fatePoints = computed(() =>
    isWeaponWish.value
      ? splitGameTextColors(
          fillGameTextValues(
            getGameText()[GameTextKey.WishFatePoint],
            pityMap.value[BannerKind.WeaponEvent].fatePoints,
            FATE_POINT_LIMIT,
          ),
        )
      : [],
  );
  return { fatePoints, isWeaponWish };
};
