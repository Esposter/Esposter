import { addWeeklyReputationClaim } from "#src/services/reputation/addWeeklyReputationClaim";
import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import { now, weeklyReset } from "#src/services/reputation/constants.test";
import { describe, expect, test } from "vitest";

describe(addWeeklyReputationClaim, () => {
  test("a fourth claim of a kind in the week is refused", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, (_value, index) =>
      weeklyReset.add({ minutes: index + 1 }),
    );

    expect(addWeeklyReputationClaim(claimedAts, now)).toBeUndefined();
  });

  test("the weekly reset restarts the count", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, (_value, index) =>
      weeklyReset.subtract({ hours: index + 1 }),
    );

    expect(addWeeklyReputationClaim(claimedAts, now)).toStrictEqual([now]);
  });

  test("a claim at the reset counts toward the new week", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, () => weeklyReset);

    expect(addWeeklyReputationClaim(claimedAts, now)).toBeUndefined();
  });
});
