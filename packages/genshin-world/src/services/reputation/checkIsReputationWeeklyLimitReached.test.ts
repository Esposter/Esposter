import { checkIsReputationWeeklyLimitReached } from "#src/services/reputation/checkIsReputationWeeklyLimitReached";
import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(checkIsReputationWeeklyLimitReached, () => {
  // The epoch is a Thursday, so the Monday that starts its week is four days on, at the server's 04:00 reset
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const weeklyReset = epoch.add({ hours: 24 * 4 - GAME_DAY_START_HOUR });
  const now = weeklyReset.add({ hours: 24 * 2 });

  test("should hold the limit reached once the week's claims reach it, and not before", () => {
    expect.hasAssertions();

    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, (_value, index) =>
      weeklyReset.add({ hours: index }),
    );

    expect(checkIsReputationWeeklyLimitReached(claimedAts.slice(1), now)).toBe(false);
    expect(checkIsReputationWeeklyLimitReached(claimedAts, now)).toBe(true);
  });
});
