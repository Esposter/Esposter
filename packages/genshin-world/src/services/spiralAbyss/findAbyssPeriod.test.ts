import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";
import { findAbyssPeriod } from "#src/services/spiralAbyss/findAbyssPeriod";
import { describe, expect, test } from "vitest";

describe(findAbyssPeriod, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const EPOCH_ZONED = EPOCH.toZonedDateTimeISO(GAME_TIME_ZONE);
  const EPOCH_LOCAL_START = EPOCH_ZONED.toPlainDateTime();
  const SECOND_PERIOD_START = EPOCH_LOCAL_START.add({ days: 30 });
  // Listed out of order, as the schedule table holds its rows
  const periods: AbyssPeriod[] = [
    { floorIds: [], id: 2, rewardGroup: 1, startsAt: SECOND_PERIOD_START.toString() },
    { floorIds: [], id: 1, rewardGroup: 1, startsAt: EPOCH_LOCAL_START.toString() },
  ];

  test("should run the period that began latest before now", () => {
    expect.hasAssertions();

    expect(findAbyssPeriod(periods, EPOCH_ZONED.add({ days: 31 }).toInstant())).toStrictEqual(periods[0]);
  });

  test("should keep the last period a dump holds once it has ended", () => {
    expect.hasAssertions();

    expect(findAbyssPeriod(periods, EPOCH_ZONED.add({ days: 365 }).toInstant())).toStrictEqual(periods[0]);
  });

  test("should run no period before the first one begins", () => {
    expect.hasAssertions();

    expect(findAbyssPeriod(periods, EPOCH_ZONED.subtract({ days: 1 }).toInstant())).toBeUndefined();
  });
});
