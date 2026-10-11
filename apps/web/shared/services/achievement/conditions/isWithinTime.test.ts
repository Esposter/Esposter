import { isWithinTime } from "#shared/services/achievement/conditions/isWithinTime";
import { afterEach, describe, expect, test, vi } from "vitest";

// A wall-clock hour on the epoch's day in a time zone, so the window is read against the day that zone's own midnight
// Starts
const freezeAtHour = (hour: number, timeZone: string) => {
  const zonedDateTime = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO(timeZone).with({ hour });
  vi.useFakeTimers({ now: zonedDateTime.epochMilliseconds, toFake: ["Date", "Temporal"] });
};

describe(isWithinTime, () => {
  const isEarlyMorning = isWithinTime({ maximum: 7, minimum: 5, referenceUnit: "day", unit: "hour" });
  const timeZone = "UTC";

  afterEach(() => {
    vi.useRealTimers();
  });

  test("holds from the window's first whole unit up to, not including, its last", () => {
    expect.hasAssertions();

    freezeAtHour(5, timeZone);

    expect(isEarlyMorning({ timeZone })).toBe(true);

    freezeAtHour(6, timeZone);

    expect(isEarlyMorning({ timeZone })).toBe(true);
  });

  test("misses before the window and at its exclusive end", () => {
    expect.hasAssertions();

    freezeAtHour(4, timeZone);

    expect(isEarlyMorning({ timeZone })).toBe(false);

    freezeAtHour(7, timeZone);

    expect(isEarlyMorning({ timeZone })).toBe(false);
  });

  test("reads the hour in the time zone it is handed, whatever the server's", () => {
    expect.hasAssertions();

    const readerTimeZone = "Australia/Sydney";
    freezeAtHour(6, readerTimeZone);

    expect(isEarlyMorning({ timeZone: readerTimeZone })).toBe(true);
    expect(isEarlyMorning({ timeZone })).toBe(false);
  });
});
