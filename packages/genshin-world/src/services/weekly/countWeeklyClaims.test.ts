import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { countWeeklyClaims } from "#src/services/weekly/countWeeklyClaims";
import { describe, expect, test } from "vitest";

describe(countWeeklyClaims, () => {
  // The epoch is a Thursday, so the Monday that starts its week is four days on, at the server's 04:00 reset
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const weeklyReset = epoch.add({ hours: 24 * 4 - GAME_DAY_START_HOUR });
  const now = weeklyReset.add({ hours: 24 * 2 });

  test("counts the claims made since the week's reset, one at the reset among them", () => {
    expect.hasAssertions();

    const claimedAts = [weeklyReset.subtract({ minutes: 1 }), weeklyReset, weeklyReset.add({ hours: 24 })];

    expect(countWeeklyClaims(claimedAts, now)).toBe(2);
  });

  test("counts a claim at now, never one made after it", () => {
    expect.hasAssertions();

    expect(countWeeklyClaims([now, now.add({ minutes: 1 })], now)).toBe(1);
  });

  test("counts none when no claim was made this week, a claim from last week not among them", () => {
    expect.hasAssertions();

    expect(countWeeklyClaims([], now)).toBe(0);
    expect(countWeeklyClaims([weeklyReset.subtract({ hours: 24 * 7 })], now)).toBe(0);
  });
});
