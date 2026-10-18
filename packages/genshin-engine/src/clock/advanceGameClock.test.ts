import { advanceGameClock } from "#src/clock/advanceGameClock";
import { GAME_MINUTES_PER_SECOND, MINUTES_PER_DAY } from "#src/clock/constants";
import { describe, expect, test } from "vitest";

describe(advanceGameClock, () => {
  test("a day is counted when the clock wraps past midnight", () => {
    expect.hasAssertions();

    const gameClock = { days: 0, minutes: MINUTES_PER_DAY - 1, minutesPerSecond: GAME_MINUTES_PER_SECOND };
    advanceGameClock(gameClock, 2);

    expect(gameClock).toStrictEqual({ days: 1, minutes: 1, minutesPerSecond: GAME_MINUTES_PER_SECOND });
  });

  test("every midnight a fast-forwarded frame passes is counted", () => {
    expect.hasAssertions();

    const gameClock = { days: 1, minutes: 0, minutesPerSecond: MINUTES_PER_DAY };
    advanceGameClock(gameClock, 2.5);

    expect(gameClock).toStrictEqual({ days: 3, minutes: MINUTES_PER_DAY / 2, minutesPerSecond: MINUTES_PER_DAY });
  });
});
