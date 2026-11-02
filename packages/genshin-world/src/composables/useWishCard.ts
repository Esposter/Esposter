import type { Trial } from "#src/models/trial/Trial";
import type { Banner } from "#src/models/wish/Banner";
import type { GameText } from "genshin-text";
import type { ComputedRef } from "vue";

import { findBannerTrial } from "#src/services/trial/findBannerTrial";
import { BannerKind } from "genshin-interface";
import { GameTextKey, splitGameTextColors } from "genshin-text";
import { computed } from "vue";

interface WishCardSource {
  // The open banner, whose featured character's trial the card's button opens
  banner: ComputedRef<Banner | undefined>;
  // The open banner's kind, which the card and its five-star notice are read by
  bannerKind: ComputedRef<BannerKind | undefined>;
  // The game's words in the reader's language
  getGameText: () => GameText;
  // The character trials, each offered on the banner whose featured five-star is its character
  getTrials: () => readonly Trial[];
}

// The card the open banner shows, its trial and the five-star notice a drawn five-star gives, each in the reader's language
export const useWishCard = ({ banner, bannerKind, getGameText, getTrials }: WishCardSource) => {
  // The trial the open banner's featured character has, which the card's button opens
  const bannerTrial = computed(() =>
    banner.value ? findBannerTrial(getTrials(), banner.value.featuredFiveStars) : undefined,
  );
  // The Character Event banner's card, the banner the world builds its card for
  const bannerCard = computed(() => {
    if (bannerKind.value !== BannerKind.CharacterEvent) return undefined;
    const text = getGameText();
    return {
      featuredTitle: text[GameTextKey.WishCharacterEventFeaturedTitle],
      rateUp: text[GameTextKey.WishRateUp],
      title: splitGameTextColors(text[GameTextKey.WishCharacterEventTitle]),
    };
  });
  // The five-star notice a card gives: the character one on a character event, the weapon one on a weapon event
  const fiveStarNotice = computed(() => {
    const text = getGameText();
    if (bannerKind.value === BannerKind.CharacterEvent) return text[GameTextKey.WishFiveStarCharacterNotice];
    return bannerKind.value === BannerKind.WeaponEvent ? text[GameTextKey.WishFiveStarWeaponNotice] : "";
  });
  return { bannerCard, bannerTrial, fiveStarNotice };
};
