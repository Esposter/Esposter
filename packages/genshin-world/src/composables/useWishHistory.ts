import type { StatTables } from "#src/models/character/StatTables";
import type { WishDrawSave } from "#src/models/wish/WishDrawSave";
import type { GameText } from "genshin-text";
import type { Ref } from "vue";

import { BannerKindGameTextKeyMap } from "#src/services/wish/BannerKindGameTextKeyMap";
import { toWishHistoryCells } from "#src/services/wish/toWishHistoryCells";
import { splitGameTextColors } from "genshin-text";
import { computed } from "vue";

interface WishHistorySource {
  // The game's words in the reader's language, which each draw's banner is labelled in
  getGameText: () => GameText;
  // The names the stat tables cite by text id, in the reader's language
  getNameText: () => Readonly<Record<string, string>>;
  // The game's stat tables, which each draw's item is named from
  getStatTables: () => StatTables;
  // The draws the wish history keeps
  wishHistory: Ref<WishDrawSave[]>;
}

// The draws the History popup lists, each named from the stat tables and its banner labelled in the reader's language
export const useWishHistory = ({ getGameText, getNameText, getStatTables, wishHistory }: WishHistorySource) =>
  computed(() =>
    toWishHistoryCells(
      wishHistory.value,
      (itemId) => {
        const { characterDataMap, weaponDataMap } = getStatTables();
        const data = characterDataMap.get(itemId) ?? weaponDataMap.get(itemId);
        return data ? { name: getNameText()[data.nameTextId] ?? "", rarity: data.rarity } : { name: "", rarity: 0 };
      },
      (bannerKind) =>
        splitGameTextColors(getGameText()[BannerKindGameTextKeyMap[bannerKind]])
          .map(({ text }) => text)
          .join(""),
      Temporal.Now.timeZoneId(),
    ),
  );
