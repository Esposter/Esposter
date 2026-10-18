import type { WishDrawSave } from "#src/models/wish/WishDrawSave";
import type { WishHistoryCell } from "#src/models/wish/WishHistoryCell";
import type { BannerKind } from "genshin-interface/save";

// The wish history as the History panel lists it, the newest draw first: each draw's banner label, its item's name and
// Rarity, and the minute it was drawn at in the given time zone
export const toWishHistoryCells = (
  history: readonly WishDrawSave[],
  getItem: (itemId: number) => { name: string; rarity: number },
  getBannerLabel: (bannerKind: BannerKind) => string,
  timeZone: string,
): WishHistoryCell[] =>
  history.toReversed().map(({ bannerKind, itemId, time }) => {
    const { name, rarity } = getItem(itemId);
    return {
      bannerLabel: getBannerLabel(bannerKind),
      name,
      rarity,
      time: Temporal.Instant.from(time)
        .toZonedDateTimeISO(timeZone)
        .toPlainDateTime()
        .toString({ smallestUnit: "minute" }),
    };
  });
