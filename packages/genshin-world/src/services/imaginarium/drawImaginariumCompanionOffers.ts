import type { ImaginariumCastCandidate } from "#src/models/imaginarium/ImaginariumCastCandidate";
import type { ImaginariumCompanionPool } from "#src/models/imaginarium/ImaginariumCompanionPool";
import type { ImaginariumDifficulty } from "#src/models/imaginarium/ImaginariumDifficulty";
import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

import { checkIsImaginariumCastEligible } from "#src/services/imaginarium/checkIsImaginariumCastEligible";
import { drawRandomSubset } from "#src/services/imaginarium/drawRandomSubset";

// A Companion event's offers: the eligible characters of its pool's element, or of any element, drawn at random from
// The world's one seeded source. The same source gives the same offers
export const drawImaginariumCompanionOffers = (
  pool: ImaginariumCompanionPool,
  season: ImaginariumSeason,
  difficulty: ImaginariumDifficulty,
  candidates: readonly ImaginariumCastCandidate[],
  random: () => number,
): ImaginariumCastCandidate[] =>
  drawRandomSubset(
    candidates.filter(
      (candidate) =>
        (pool.element === undefined || candidate.element === pool.element) &&
        checkIsImaginariumCastEligible(season, difficulty, candidate),
    ),
    pool.offerCount,
    random,
  );
