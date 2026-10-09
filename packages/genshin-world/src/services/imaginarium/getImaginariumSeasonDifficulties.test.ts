import type { ImaginariumDifficulty } from "#src/models/imaginarium/ImaginariumDifficulty";
import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

import { getImaginariumSeasonDifficulties } from "#src/services/imaginarium/getImaginariumSeasonDifficulties";
import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";
import { describe, expect, test } from "vitest";

describe(getImaginariumSeasonDifficulties, () => {
  const SEASON_START = Temporal.Instant.fromEpochMilliseconds(0)
    .toZonedDateTimeISO(GAME_TIME_ZONE)
    .toPlainDateTime()
    .toString();
  // The season names its third and first difficulties, and the table holds one the season does not run
  const season: ImaginariumSeason = {
    beginsAt: SEASON_START,
    difficultyIds: [3, 1],
    endsAt: SEASON_START,
    id: 1,
    rewardGroup: 1,
  };
  const difficulties: ImaginariumDifficulty[] = [
    { id: 1, level: 1, levelFloor: 60 },
    { id: 2, level: 2, levelFloor: 60 },
    { id: 3, level: 3, levelFloor: 70 },
  ];

  test("should pick the season's difficulties and order them from the lowest level", () => {
    expect.hasAssertions();

    expect(getImaginariumSeasonDifficulties(season, difficulties)).toStrictEqual([difficulties[0], difficulties[2]]);
  });
});
