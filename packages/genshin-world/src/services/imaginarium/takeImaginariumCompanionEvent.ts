import type { ImaginariumCastCandidate } from "#src/models/imaginarium/ImaginariumCastCandidate";
import type { ImaginariumCompanionEvent } from "#src/models/imaginarium/ImaginariumCompanionEvent";
import type { ImaginariumDifficulty } from "#src/models/imaginarium/ImaginariumDifficulty";
import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

import { drawImaginariumCompanionOffers } from "#src/services/imaginarium/drawImaginariumCompanionOffers";
import { spendImaginariumCount } from "#src/services/imaginarium/spendImaginariumCount";

// A Companion event taken with the Fantasia Flowers a run holds: its price spent and its offers drawn, or, when the
// Flowers do not cover the price, refused with the flowers as they were and no offers
export const takeImaginariumCompanionEvent = (
  event: ImaginariumCompanionEvent,
  flowers: number,
  season: ImaginariumSeason,
  difficulty: ImaginariumDifficulty,
  candidates: readonly ImaginariumCastCandidate[],
  random: () => number,
): { flowers: number; isTaken: boolean; offers: ImaginariumCastCandidate[] } => {
  const { count, isSpent } = spendImaginariumCount(flowers, event.flowerPrice);
  return isSpent
    ? {
        flowers: count,
        isTaken: true,
        offers: drawImaginariumCompanionOffers(event.pool, season, difficulty, candidates, random),
      }
    : { flowers, isTaken: false, offers: [] };
};
