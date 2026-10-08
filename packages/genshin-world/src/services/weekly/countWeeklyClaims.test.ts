import { DAILY_RESET_TIME } from "#src/services/enemy/constants";
import { countWeeklyClaims } from "#src/services/weekly/countWeeklyClaims";
import { describe, expect, test } from "vitest";

describe(countWeeklyClaims, () => {
  // The epoch is a Thursday, so four days on is the Monday that starts its week
  const epoch = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC");
  const weeklyReset = epoch
    .toPlainDate()
    .add({ days: 4 })
    .toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: "UTC" });
  const now = weeklyReset.add({ days: 2 });

  test("counts the claims made since the week's reset, one at the reset among them", () => {
    expect.hasAssertions();

    const claimedAts = [weeklyReset.subtract({ minutes: 1 }), weeklyReset, weeklyReset.add({ days: 1 })];

    expect(countWeeklyClaims(claimedAts, now)).toBe(2);
  });

  test("counts a claim at now, never one made after it", () => {
    expect.hasAssertions();

    expect(countWeeklyClaims([now, now.add({ minutes: 1 })], now)).toBe(1);
  });

  test("counts none when no claim was made this week, a claim from last week not among them", () => {
    expect.hasAssertions();

    expect(countWeeklyClaims([], now)).toBe(0);
    expect(countWeeklyClaims([weeklyReset.subtract({ weeks: 1 })], now)).toBe(0);
  });
});
