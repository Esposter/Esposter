import type { ImaginariumCastCandidate } from "#src/models/imaginarium/ImaginariumCastCandidate";
import type { ImaginariumCompanionPool } from "#src/models/imaginarium/ImaginariumCompanionPool";
import type { ImaginariumDifficulty } from "#src/models/imaginarium/ImaginariumDifficulty";
import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

import { checkIsImaginariumCastEligible } from "#src/services/imaginarium/checkIsImaginariumCastEligible";

// A Companion event's offers: the eligible characters of its pool's element, or of any element, each given a draw from the
// Random source, the first ones by draw taken. The same source gives the same offers, as the world's one seeded source does
export const drawImaginariumCompanionOffers = (
  pool: ImaginariumCompanionPool,
  season: ImaginariumSeason,
  difficulty: ImaginariumDifficulty,
  candidates: readonly ImaginariumCastCandidate[],
  random: () => number,
): ImaginariumCastCandidate[] =>
  candidates
    .filter(
      (candidate) =>
        (pool.element === undefined || candidate.element === pool.element) &&
        checkIsImaginariumCastEligible(season, difficulty, candidate),
    )
    .map((candidate) => ({ candidate, draw: random() }))
    .toSorted((firstEntry, secondEntry) => firstEntry.draw - secondEntry.draw)
    .slice(0, pool.offerCount)
    .map(({ candidate }) => candidate);
