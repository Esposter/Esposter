import { checkIsMiningOutcropStanding } from "#src/services/leyLine/checkIsMiningOutcropStanding";
import { describe, expect, test } from "vitest";

describe(checkIsMiningOutcropStanding, () => {
  // Four o'clock in the game's time zone, UTC+8, is the daily reset of the day the epoch begins
  const refresh = Temporal.Instant.fromEpochMilliseconds(0).subtract({ hours: 4 });

  test("a mining outcrop not mined stands", () => {
    expect.hasAssertions();
    expect(checkIsMiningOutcropStanding(undefined, refresh)).toBe(true);
  });

  test("a mined mining outcrop is gone until the next day's draw, and stands from it", () => {
    expect.hasAssertions();
    const minedAt = refresh;
    const respawnAt = refresh.add({ hours: 24 });
    expect(checkIsMiningOutcropStanding(minedAt, respawnAt.subtract({ seconds: 1 }))).toBe(false);
    expect(checkIsMiningOutcropStanding(minedAt, respawnAt)).toBe(true);
  });
});
