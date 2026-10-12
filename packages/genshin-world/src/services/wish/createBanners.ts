import type { StatTables } from "#src/models/character/StatTables";
import type { Banner } from "#src/models/wish/Banner";
import type { WishItem } from "#src/models/wish/WishItem";

import { WishItemKind } from "#src/models/wish/WishItemKind";
import {
  BEGINNERS_WISH_CHARACTER_IDS,
  BEGINNERS_WISH_FEATURED_CHARACTER_ID,
  CHARACTER_EVENT_FEATURED_FIVE_STAR_IDS,
  CHARACTER_EVENT_FEATURED_FOUR_STAR_IDS,
  CHARACTER_EVENT_FIVE_STAR_IDS,
  CHARACTER_EVENT_FOUR_STAR_IDS,
  STANDARD_WISH_CHARACTER_IDS,
  STANDARD_WISH_FOUR_AND_THREE_STAR_WEAPON_IDS,
  STANDARD_WISH_WEAPON_IDS,
} from "#src/services/wish/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { BannerKind } from "genshin-interface";

// A banner of a kind whose items are split by rarity, with its promoted five-stars and four-stars
const toBanner = (
  kind: BannerKind,
  items: WishItem[],
  featuredFiveStars: WishItem[],
  featuredFourStars: WishItem[],
): Banner => ({
  featuredFiveStars,
  featuredFourStars,
  fiveStars: items.filter(({ rarity }) => rarity === 5),
  fourStars: items.filter(({ rarity }) => rarity === 4),
  kind,
  threeStars: items.filter(({ rarity }) => rarity === 3),
});
// The banners the world offers, their pools as the wiki lists them, each item's rarity read from the stat tables and its
// Name from the names they cite in the reader's language: the beginners' wish, with Noelle featured for its eighth wish,
// The standard wish, and the Character Event wish of Born of Ocean Swell, the one event banner built (provisional: its
// Pool is the wiki's, and the rotation of event banners is not built yet)
export const createBanners = (
  { characterDataMap, weaponDataMap }: Pick<StatTables, "characterDataMap" | "weaponDataMap">,
  nameText: Readonly<Record<string, string>>,
): Banner[] => {
  const toWishItems = (ids: readonly number[], kind: WishItemKind): WishItem[] =>
    ids.map((id) => {
      const itemData = kind === WishItemKind.Character ? characterDataMap.get(id) : weaponDataMap.get(id);
      if (!itemData) throw new InvalidOperationError(Operation.Read, createBanners.name, `${kind} ${id}`);
      return { id, kind, name: nameText[itemData.nameTextId] ?? "", rarity: itemData.rarity };
    });
  const standardItems = [
    ...toWishItems(STANDARD_WISH_CHARACTER_IDS, WishItemKind.Character),
    ...toWishItems(STANDARD_WISH_WEAPON_IDS, WishItemKind.Weapon),
  ];
  const beginnersItems = [
    ...toWishItems(BEGINNERS_WISH_CHARACTER_IDS, WishItemKind.Character),
    ...standardItems.filter(({ kind, rarity }) => kind === WishItemKind.Weapon && rarity === 3),
  ];
  const characterEventItems = [
    ...toWishItems(CHARACTER_EVENT_FIVE_STAR_IDS, WishItemKind.Character),
    ...toWishItems(CHARACTER_EVENT_FOUR_STAR_IDS, WishItemKind.Character),
    ...toWishItems(STANDARD_WISH_FOUR_AND_THREE_STAR_WEAPON_IDS, WishItemKind.Weapon),
  ];
  return [
    toBanner(
      BannerKind.Beginners,
      beginnersItems,
      [],
      toWishItems([BEGINNERS_WISH_FEATURED_CHARACTER_ID], WishItemKind.Character),
    ),
    toBanner(
      BannerKind.CharacterEvent,
      characterEventItems,
      toWishItems(CHARACTER_EVENT_FEATURED_FIVE_STAR_IDS, WishItemKind.Character),
      toWishItems(CHARACTER_EVENT_FEATURED_FOUR_STAR_IDS, WishItemKind.Character),
    ),
    toBanner(BannerKind.Standard, standardItems, [], []),
  ];
};
