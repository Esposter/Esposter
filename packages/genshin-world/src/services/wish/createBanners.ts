import type { Banner } from "#src/models/wish/Banner";
import type { WishItem } from "#src/models/wish/WishItem";
import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";

import { WishItemKind } from "#src/models/wish/WishItemKind";
import {
  BEGINNERS_WISH_CHARACTER_IDS,
  BEGINNERS_WISH_FEATURED_CHARACTER_ID,
  STANDARD_WISH_CHARACTER_IDS,
  STANDARD_WISH_WEAPON_IDS,
} from "#src/services/wish/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { BannerKind } from "genshin-interface";

// The stat-table fields a banner reads an item by: its name's text id and its rarity
interface WishItemData {
  nameTextId: string;
  rarity: number;
}

// A banner of a kind whose items are split by rarity, with its promoted five-stars and four-stars
const toBanner = (
  id: string,
  kind: BannerKind,
  items: WishItem[],
  featuredFiveStars: WishItem[],
  featuredFourStars: WishItem[],
): Banner => ({
  featuredFiveStars,
  featuredFourStars,
  fiveStars: items.filter(({ rarity }) => rarity === 5),
  fourStars: items.filter(({ rarity }) => rarity === 4),
  id,
  kind,
  kindNumber: 1,
  threeStars: items.filter(({ rarity }) => rarity === 3),
});
// The banners the world offers, each item's rarity read from the stat tables and its name from the names they cite in
// The reader's language: the beginners' wish, with Noelle featured for its eighth wish, the standard wish, and each event
// Banner the schedule has open. An event banner's pool is the standard wish's, derived once and shared by every event
// Banner, and only its featured items are its own, read from the schedule
export const createBanners = (
  {
    characterDataMap,
    weaponDataMap,
  }: { characterDataMap: ReadonlyMap<number, WishItemData>; weaponDataMap: ReadonlyMap<number, WishItemData> },
  nameText: Readonly<Record<string, string>>,
  openEvents: readonly WishScheduleEvent[],
): Banner[] => {
  const toWishItem = (id: number, kind: WishItemKind): WishItem => {
    const itemData = kind === WishItemKind.Character ? characterDataMap.get(id) : weaponDataMap.get(id);
    if (!itemData) throw new InvalidOperationError(Operation.Read, createBanners.name, `${kind} ${id}`);
    return { id, kind, name: nameText[itemData.nameTextId] ?? "", rarity: itemData.rarity };
  };
  const toWishItems = (ids: readonly number[], kind: WishItemKind): WishItem[] => ids.map((id) => toWishItem(id, kind));
  // A schedule names its featured items by id alone, so each is read from the table that holds it
  const toFeaturedItems = (ids: readonly number[]): WishItem[] =>
    ids.map((id) => toWishItem(id, characterDataMap.has(id) ? WishItemKind.Character : WishItemKind.Weapon));
  const standardItems = [
    ...toWishItems(STANDARD_WISH_CHARACTER_IDS, WishItemKind.Character),
    ...toWishItems(STANDARD_WISH_WEAPON_IDS, WishItemKind.Weapon),
  ];
  const standardBanner = toBanner(BannerKind.Standard, BannerKind.Standard, standardItems, [], []);
  const beginnersItems = [
    ...toWishItems(BEGINNERS_WISH_CHARACTER_IDS, WishItemKind.Character),
    ...standardItems.filter(({ kind, rarity }) => kind === WishItemKind.Weapon && rarity === 3),
  ];
  return [
    toBanner(
      BannerKind.Beginners,
      BannerKind.Beginners,
      beginnersItems,
      [],
      toWishItems([BEGINNERS_WISH_FEATURED_CHARACTER_ID], WishItemKind.Character),
    ),
    ...openEvents.map((event) => ({
      ...standardBanner,
      featuredFiveStars: toFeaturedItems(event.fiveStarIds),
      featuredFourStars: toFeaturedItems(event.fourStarIds),
      id: event.id,
      kind: event.kind,
      kindNumber: event.kindNumber,
    })),
    standardBanner,
  ];
};
