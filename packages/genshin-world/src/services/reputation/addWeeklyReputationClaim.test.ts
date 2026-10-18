import { addWeeklyReputationClaim } from "#src/services/reputation/addWeeklyReputationClaim";
import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(addWeeklyReputationClaim, () => {
  // The epoch is a Thursday, so the Monday that starts its week is four days on, at the server's 04:00 reset
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const weeklyReset = epoch.add({ hours: 24 * 4 - GAME_DAY_START_HOUR });
  const now = weeklyReset.add({ hours: 24 * 2 });

  test("A fourth claim of a kind in the week is refused", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, (_value, index) =>
      weeklyReset.add({ minutes: index + 1 }),
    );

    expect(addWeeklyReputationClaim(claimedAts, now)).toBeUndefined();
  });

  test("The weekly reset restarts the count", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, (_value, index) =>
      weeklyReset.subtract({ hours: index + 1 }),
    );

    expect(addWeeklyReputationClaim(claimedAts, now)).toStrictEqual([now]);
  });

  test("A claim at the reset counts toward the new week", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, () => weeklyReset);

    expect(addWeeklyReputationClaim(claimedAts, now)).toBeUndefined();
  });
});
