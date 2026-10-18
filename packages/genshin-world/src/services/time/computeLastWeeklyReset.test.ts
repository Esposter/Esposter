import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { computeLastWeeklyReset } from "#src/services/time/computeLastWeeklyReset";
import { describe, expect, test } from "vitest";

describe(computeLastWeeklyReset, () => {
  // The epoch is a Thursday eight in the morning in the server's zone, so the Monday before it is three days and four hours back
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const WEEKLY_RESET = EPOCH.subtract({ hours: 24 * 3 + GAME_DAY_START_HOUR });

  test("the weekly reset falls on Monday's 04:00", () => {
    expect.hasAssertions();

    expect(computeLastWeeklyReset(EPOCH).toString()).toBe(WEEKLY_RESET.toString());
    expect(computeLastWeeklyReset(WEEKLY_RESET).toString()).toBe(WEEKLY_RESET.toString());
  });

  test("the instant just before Monday's 04:00 belongs to the week before", () => {
    expect.hasAssertions();

    expect(computeLastWeeklyReset(WEEKLY_RESET.subtract({ milliseconds: 1 })).toString()).toBe(
      WEEKLY_RESET.subtract({ hours: 24 * 7 }).toString(),
    );
  });

  test("a moment on Sunday belongs to the week that began the Monday before", () => {
    expect.hasAssertions();

    expect(computeLastWeeklyReset(WEEKLY_RESET.add({ hours: 24 * 6 + 12 })).toString()).toBe(WEEKLY_RESET.toString());
  });
});
