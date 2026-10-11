import { isWithinTime } from "#shared/services/achievement/conditions/isWithinTime";
import { afterEach, describe, expect, test, vi } from "vitest";

// A local wall-clock hour on a fixed day, so the window is read against the day the zone's own midnight starts
const freezeAtHour = (hour: number) => {
  const instant = Temporal.ZonedDateTime.from({
    day: 1,
    hour,
    month: 1,
    timeZone: Temporal.Now.timeZoneId(),
    year: 2026,
  });
  vi.useFakeTimers({ now: instant.epochMilliseconds, toFake: ["Date", "Temporal"] });
};

describe(isWithinTime, () => {
  const isEarlyMorning = isWithinTime({ maximum: 7, minimum: 5, referenceUnit: "day", unit: "hour" });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("holds from the window's first whole unit up to, not including, its last", () => {
    expect.hasAssertions();

    freezeAtHour(5);

    expect(isEarlyMorning()).toBe(true);

    freezeAtHour(6);

    expect(isEarlyMorning()).toBe(true);
  });

  test("misses before the window and at its exclusive end", () => {
    expect.hasAssertions();

    freezeAtHour(4);

    expect(isEarlyMorning()).toBe(false);

    freezeAtHour(7);

    expect(isEarlyMorning()).toBe(false);
  });
});
