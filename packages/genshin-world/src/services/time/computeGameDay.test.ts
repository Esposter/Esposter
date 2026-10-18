import { computeGameDay } from "#src/services/time/computeGameDay";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(computeGameDay, () => {
  // The epoch is eight in the morning in the server's zone, four hours past that day's 04:00 reset
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const EPOCH_DAY = EPOCH.toZonedDateTimeISO(GAME_TIME_ZONE).toPlainDate();

  test("a moment after the day's 04:00 reset belongs to that day", () => {
    expect.hasAssertions();

    expect(computeGameDay(EPOCH).toString()).toBe(EPOCH_DAY.toString());
  });

  test("the instant just before 04:00 still belongs to the previous day", () => {
    expect.hasAssertions();

    const justBeforeReset = EPOCH.subtract({ hours: GAME_DAY_START_HOUR, milliseconds: 1 });

    expect(computeGameDay(justBeforeReset).toString()).toBe(EPOCH_DAY.subtract({ days: 1 }).toString());
    expect(computeGameDay(EPOCH.subtract({ hours: GAME_DAY_START_HOUR })).toString()).toBe(EPOCH_DAY.toString());
  });
});
