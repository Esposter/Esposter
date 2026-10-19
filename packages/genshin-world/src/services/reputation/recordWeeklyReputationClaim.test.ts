import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import { now, weeklyReset } from "#src/services/reputation/constants.test";
import { recordWeeklyReputationClaim } from "#src/services/reputation/recordWeeklyReputationClaim";
import { describe, expect, test } from "vitest";

describe(recordWeeklyReputationClaim, () => {
  const toEpochs = (claimedAts: readonly Temporal.Instant[]) =>
    claimedAts.map(({ epochMilliseconds }) => epochMilliseconds);

  test("a claim past the limit is still recorded, and the list keeps the newest claims of the week", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, (_value, index) =>
      weeklyReset.add({ minutes: index + 1 }),
    );

    expect(toEpochs(recordWeeklyReputationClaim(claimedAts, now))).toStrictEqual(
      toEpochs([...claimedAts.slice(1), now]),
    );
  });
});
