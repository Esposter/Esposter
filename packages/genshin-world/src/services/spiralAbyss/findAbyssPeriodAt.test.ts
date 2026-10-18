import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { GAME_TIME_ZONE } from "#src/services/time/constants";
import { findAbyssPeriodAt } from "#src/services/spiralAbyss/findAbyssPeriodAt";
import { describe, expect, test } from "vitest";

const BLESSING = { descriptionTextHash: 1, icon: "UI_TowerBlessing_1", nameTextHash: 2 };
const PERIOD_DAYS = 30;
const GAME_EPOCH = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO(GAME_TIME_ZONE).toPlainDateTime();
const FIRST_OPENS = GAME_EPOCH;
const SECOND_OPENS = GAME_EPOCH.add({ days: PERIOD_DAYS });
const FIRST_CLOSES = SECOND_OPENS.subtract({ seconds: 1 });
const SECOND_CLOSES = SECOND_OPENS.add({ days: PERIOD_DAYS }).subtract({ seconds: 1 });
const instantAt = (dateTime: Temporal.PlainDateTime) => dateTime.toZonedDateTime(GAME_TIME_ZONE).toInstant();
const createPeriod = (id: number, startsAt: Temporal.PlainDateTime, closesAt: Temporal.PlainDateTime): AbyssPeriod => ({
  blessing: BLESSING,
  closesAt: closesAt.toString(),
  floorIds: [1134, 1135, 1140, 1141],
  id,
  rewardGroup: 15,
  startsAt: startsAt.toString(),
});
const periods = [createPeriod(1, FIRST_OPENS, FIRST_CLOSES), createPeriod(2, SECOND_OPENS, SECOND_CLOSES)];

describe(findAbyssPeriodAt, () => {
  test("the period whose opening covers the instant is offered, its last second included", () => {
    expect.hasAssertions();

    expect(findAbyssPeriodAt(periods, instantAt(FIRST_CLOSES.add({ milliseconds: 900 })))?.id).toBe(1);
    expect(findAbyssPeriodAt(periods, instantAt(SECOND_OPENS))?.id).toBe(2);
  });

  test("no period is offered at an instant none covers", () => {
    expect.hasAssertions();

    expect(findAbyssPeriodAt(periods, instantAt(GAME_EPOCH.subtract({ seconds: 1 })))).toBeUndefined();
  });
});
