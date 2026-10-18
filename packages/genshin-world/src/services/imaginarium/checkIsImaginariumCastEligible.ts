import type { ImaginariumCastCandidate } from "#src/models/imaginarium/ImaginariumCastCandidate";
import type { ImaginariumDifficulty } from "#src/models/imaginarium/ImaginariumDifficulty";
import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

// Whether a character may join a season's Alternate Cast at a difficulty: a special guest of any element, or a character of
// One of the season's elements, and at or above the difficulty's level floor
export const checkIsImaginariumCastEligible = (
  season: ImaginariumSeason,
  difficulty: ImaginariumDifficulty,
  candidate: ImaginariumCastCandidate,
): boolean =>
  candidate.level >= difficulty.levelFloor &&
  (season.specialGuestIds.includes(candidate.characterId) ||
    (candidate.element !== undefined && season.elements.includes(candidate.element)));
