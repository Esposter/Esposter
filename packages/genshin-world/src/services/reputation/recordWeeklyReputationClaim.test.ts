import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import { recordWeeklyReputationClaim } from "#src/services/reputation/recordWeeklyReputationClaim";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(recordWeeklyReputationClaim, () => {
  // The epoch is a Thursday, so the Monday that starts its week is four days on, at the server's 04:00 reset
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const weeklyReset = epoch.add({ hours: 24 * 4 - GAME_DAY_START_HOUR });
  const now = weeklyReset.add({ hours: 24 * 2 });
  const toEpochs = (claimedAts: readonly Temporal.Instant[]) =>
    claimedAts.map(({ epochMilliseconds }) => epochMilliseconds);

  test("A claim past the limit is still recorded, and the list keeps the newest claims of the week", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, (_value, index) =>
      weeklyReset.add({ minutes: index + 1 }),
    );

    expect(toEpochs(recordWeeklyReputationClaim(claimedAts, now))).toStrictEqual(
      toEpochs([...claimedAts.slice(1), now]),
    );
  });
});
