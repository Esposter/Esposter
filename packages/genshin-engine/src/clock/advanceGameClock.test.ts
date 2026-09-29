import { advanceGameClock } from "#src/clock/advanceGameClock";
import { GAME_MINUTES_PER_SECOND, MINUTES_PER_DAY } from "#src/clock/constants";
import { describe, expect, test } from "vitest";

describe(advanceGameClock, () => {
  test("wraps past midnight", () => {
    expect.hasAssertions();

    const gameClock = { minutes: MINUTES_PER_DAY - 1, minutesPerSecond: GAME_MINUTES_PER_SECOND };
    advanceGameClock(gameClock, 2);

    expect(gameClock).toStrictEqual({ minutes: 1, minutesPerSecond: GAME_MINUTES_PER_SECOND });
  });
});
