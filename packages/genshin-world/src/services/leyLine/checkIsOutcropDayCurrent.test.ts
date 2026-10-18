import { checkIsOutcropDayCurrent } from "#src/services/leyLine/checkIsOutcropDayCurrent";
import { describe, expect, test } from "vitest";

describe(checkIsOutcropDayCurrent, () => {
  // Four o'clock in the game's time zone, UTC+8, is the daily reset of the day the epoch begins
  const reset = Temporal.Instant.fromEpochMilliseconds(0).subtract({ hours: 4 });

  test("a draw made after the day's reset stands until the next reset", () => {
    expect.hasAssertions();
    expect(checkIsOutcropDayCurrent(reset.add({ hours: 1 }), reset.add({ hours: 23 }))).toBe(true);
    expect(checkIsOutcropDayCurrent(reset.add({ hours: 1 }), reset.add({ hours: 24 }))).toBe(false);
  });

  test("a draw made before the day's reset is stale at it", () => {
    expect.hasAssertions();
    expect(checkIsOutcropDayCurrent(reset.subtract({ hours: 1 }), reset)).toBe(false);
  });
});
