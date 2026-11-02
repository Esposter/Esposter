import type { StatTables } from "#src/models/character/StatTables";
import type { WishItem } from "#src/models/wish/WishItem";
import type { WishPity } from "#src/models/wish/WishPity";
import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";
import type { GameText } from "genshin-text";
import type { Ref } from "vue";

import { BannerKindGameTextKeyMap } from "#src/services/wish/BannerKindGameTextKeyMap";
import { BEGINNERS_WISH_LIMIT } from "#src/services/wish/constants";
import { createBanners } from "#src/services/wish/createBanners";
import { getOpenEventBanners } from "#src/services/wish/getOpenEventBanners";
import { BannerKind, BannerKinds } from "genshin-interface";
import { splitGameTextColors } from "genshin-text";
import { computed, ref } from "vue";

interface WishBannersSource {
  // The game's words in the reader's language, which each banner is labelled in
  getGameText: () => GameText;
  // The names the stat tables cite by text id, in the reader's language
  getNameText: () => Readonly<Record<string, string>>;
  // The world's clock as the screen shows it, at which the event banners on offer are read
  getNow: () => Temporal.Instant;
  // The game's stat tables, which the banners' pools are read from
  getStatTables: () => StatTables;
  // The wish schedule's event banners, each offered only inside its window
  getWishSchedule: () => WishScheduleEvent[];
  // Each kind's counters, which the beginners' wish leaves the offers once its wishes are made
  pityMap: Ref<Readonly<Record<BannerKind, WishPity>>>;
}

// The banner the screen is on, the banners on offer and the open banner's pool: the banners the world offers now, their
// Pools read from the stat tables and named in the reader's language, the Permanent ones and each event banner the schedule
// Has open at the game's time
export const useWishBanners = ({
  getGameText,
  getNameText,
  getNow,
  getStatTables,
  getWishSchedule,
  pityMap,
}: WishBannersSource) => {
  const banners = computed(() =>
    createBanners(getStatTables(), getNameText(), getOpenEventBanners(getWishSchedule(), getNow().epochMilliseconds)),
  );
  // The banners on offer in the game's order, each kind's in the order the schedule gives them, the beginners' wish gone
  // Once its wishes are made. Each is named in the runs of colour the game words its kind in, and a second banner of a kind
  // Carries its number after the name
  const bannerOffers = computed(() =>
    BannerKinds.flatMap((kind) =>
      kind === BannerKind.Beginners && pityMap.value[kind].wishCount >= BEGINNERS_WISH_LIMIT
        ? []
        : banners.value.filter((banner) => banner.kind === kind),
    ).map((banner) => ({
      id: banner.id,
      label: [
        ...splitGameTextColors(getGameText()[BannerKindGameTextKeyMap[banner.kind]]),
        ...(banner.kindNumber > 1 ? [{ text: `-${banner.kindNumber}` }] : []),
      ],
    })),
  );
  const bannerId = ref(bannerOffers.value[0]?.id);
  const banner = computed(() => banners.value.find(({ id }) => id === bannerId.value));
  const bannerKind = computed(() => banner.value?.kind);
  const toPoolCells = (items: WishItem[], isFeatured: boolean) =>
    items.map(({ id, name, rarity }) => ({ id, isFeatured, name, rarity }));
  // What the open banner can draw, the highest rarity first and its featured items first of each rarity
  const pool = computed(() => {
    if (!banner.value) return [];
    const { featuredFiveStars, featuredFourStars, fiveStars, fourStars, threeStars } = banner.value;
    return [
      ...toPoolCells(featuredFiveStars, true),
      ...toPoolCells(fiveStars, false),
      ...toPoolCells(featuredFourStars, true),
      ...toPoolCells(fourStars, false),
      ...toPoolCells(threeStars, false),
    ];
  });
  return { banner, bannerId, bannerKind, bannerOffers, pool };
};
