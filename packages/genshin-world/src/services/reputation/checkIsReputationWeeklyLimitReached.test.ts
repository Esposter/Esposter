import { checkIsReputationWeeklyLimitReached } from "#src/services/reputation/checkIsReputationWeeklyLimitReached";
import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import { now, weeklyReset } from "#src/services/reputation/constants.test";
import { describe, expect, test } from "vitest";

describe(checkIsReputationWeeklyLimitReached, () => {
  test("should hold the limit reached once the week's claims reach it, and not before", () => {
    expect.hasAssertions();

    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, (_value, index) =>
      weeklyReset.add({ hours: index }),
    );

    expect(checkIsReputationWeeklyLimitReached(claimedAts.slice(1), now)).toBe(false);
    expect(checkIsReputationWeeklyLimitReached(claimedAts, now)).toBe(true);
  });
});
