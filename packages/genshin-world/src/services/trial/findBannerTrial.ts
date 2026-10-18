import type { Trial } from "#src/models/trial/Trial";
import type { WishItem } from "#src/models/wish/WishItem";

import { WishItemKind } from "#src/models/wish/WishItemKind";

// The trial of the first featured character that has one, in the order the banner features them.
// A character with more than one trial offers the first in the table (PROVISIONAL).
export const findBannerTrial = (
  trials: readonly Trial[],
  featuredFiveStars: readonly WishItem[],
): Trial | undefined => {
  for (const { id, kind } of featuredFiveStars) {
    if (kind !== WishItemKind.Character) continue;
    const trial = trials.find(({ characterId }) => characterId === id);
    if (trial) return trial;
  }
  return undefined;
};
