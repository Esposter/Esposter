import { DAILY_RESET_TIME } from "#src/services/enemy/constants";
import { checkIsReputationWeeklyLimitReached } from "#src/services/reputation/checkIsReputationWeeklyLimitReached";
import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import { describe, expect, test } from "vitest";

describe(checkIsReputationWeeklyLimitReached, () => {
  // The epoch is a Thursday, so four days on is the Monday that starts its week
  const epoch = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC");
  const weeklyReset = epoch
    .toPlainDate()
    .add({ days: 4 })
    .toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: "UTC" });
  const now = weeklyReset.add({ days: 2 });

  test("should hold the limit reached once the week's claims reach it, and not before", () => {
    expect.hasAssertions();

    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, (_value, index) =>
      weeklyReset.add({ hours: index }),
    );

    expect(checkIsReputationWeeklyLimitReached(claimedAts.slice(1), now)).toBe(false);
    expect(checkIsReputationWeeklyLimitReached(claimedAts, now)).toBe(true);
  });
});
