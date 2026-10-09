import type { ImaginariumDifficulty } from "#src/models/imaginarium/ImaginariumDifficulty";
import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

// The difficulties a season runs, picked out of the difficulty slice by the ids the season names and ordered from the lowest
// Level
export const getImaginariumSeasonDifficulties = (
  season: ImaginariumSeason,
  difficulties: ImaginariumDifficulty[],
): ImaginariumDifficulty[] =>
  difficulties
    .filter(({ id }) => season.difficultyIds.includes(id))
    .toSorted((firstDifficulty, secondDifficulty) => firstDifficulty.level - secondDifficulty.level);
