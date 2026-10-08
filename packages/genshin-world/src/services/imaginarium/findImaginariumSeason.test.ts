import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

import { findImaginariumSeason } from "#src/services/imaginarium/findImaginariumSeason";
import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";
import { describe, expect, test } from "vitest";

describe(findImaginariumSeason, () => {
  const EPOCH_ZONED = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO(GAME_TIME_ZONE);
  const EPOCH_START = EPOCH_ZONED.toPlainDateTime();
  const SECOND_START = EPOCH_START.add({ days: 30 });
  const THIRD_START = EPOCH_START.add({ days: 400 });
  // Listed out of order, with a season scheduled ahead of the present as the table holds one
  const seasons: ImaginariumSeason[] = [
    { beginsAt: THIRD_START.toString(), difficultyIds: [3], endsAt: THIRD_START.toString(), id: 3, rewardGroup: 1 },
    { beginsAt: SECOND_START.toString(), difficultyIds: [2], endsAt: SECOND_START.toString(), id: 2, rewardGroup: 1 },
    { beginsAt: EPOCH_START.toString(), difficultyIds: [1], endsAt: EPOCH_START.toString(), id: 1, rewardGroup: 1 },
  ];

  test("should play the season that began latest, not one scheduled ahead of now", () => {
    expect.hasAssertions();

    expect(findImaginariumSeason(seasons, EPOCH_ZONED.add({ days: 31 }).toInstant())).toStrictEqual(seasons[1]);
  });

  test("should play no season before the first one begins", () => {
    expect.hasAssertions();

    expect(findImaginariumSeason(seasons, EPOCH_ZONED.subtract({ days: 1 }).toInstant())).toBeUndefined();
  });
});
