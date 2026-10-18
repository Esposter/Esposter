import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";

import { claimWeeklyReputationBounty } from "#src/services/reputation/claimWeeklyReputationBounty";
import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(claimWeeklyReputationBounty, () => {
  const REWARD = { exp: 120, items: [{ count: 20_000, id: 202 }] };
  const CITY: ReputationCity = {
    bounties: [{ difficulty: "HUNTING_DIFFICULTY_EASY", id: 1, regionId: 101, reward: REWARD }],
    bountyTargets: [],
    explores: [],
    huntingRegions: [],
    levels: [],
    quests: [],
    requests: [],
  };
  const HUNT: ReputationBountyHunt = {
    bountyId: 1,
    isTargetDefeated: true,
    regionId: 101,
    spawn: [0, 0, 0],
    targetEnemyKindId: 20_101,
  };
  // The epoch is a Thursday, so the Monday that starts its week is four days on, at the server's 04:00 reset
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const weeklyReset = epoch.add({ hours: 24 * 4 - GAME_DAY_START_HOUR });
  const now = weeklyReset.add({ hours: 24 * 2 });

  test("a claim within the week's limit pays and is counted", () => {
    expect.hasAssertions();

    expect(claimWeeklyReputationBounty(CITY, HUNT, [weeklyReset], now)).toStrictEqual({
      claimedAts: [weeklyReset, now],
      reward: REWARD,
    });
  });

  test("a claim past the week's limit is refused", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, (_value, index) =>
      weeklyReset.add({ minutes: index + 1 }),
    );

    expect(claimWeeklyReputationBounty(CITY, HUNT, claimedAts, now)).toBeUndefined();
  });

  test("the claims of the week before the reset do not count, and are dropped", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, (_value, index) =>
      weeklyReset.subtract({ hours: index + 1 }),
    );

    expect(claimWeeklyReputationBounty(CITY, HUNT, claimedAts, now)).toStrictEqual({
      claimedAts: [now],
      reward: REWARD,
    });
  });

  test("a bounty whose target stands is not claimed and counts for nothing", () => {
    expect.hasAssertions();

    expect(claimWeeklyReputationBounty(CITY, { ...HUNT, isTargetDefeated: false }, [], now)).toBeUndefined();
  });
});
