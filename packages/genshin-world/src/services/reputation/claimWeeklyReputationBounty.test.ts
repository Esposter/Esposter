import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";

import { claimWeeklyReputationBounty } from "#src/services/reputation/claimWeeklyReputationBounty";
import { now, weeklyReset } from "#src/services/reputation/constants.test";
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

  test("a claim within the week's limit pays and is counted", () => {
    expect.hasAssertions();

    expect(claimWeeklyReputationBounty(CITY, HUNT, [weeklyReset], now)).toStrictEqual({
      claimedAts: [weeklyReset, now],
      reward: REWARD,
    });
  });

  test("a bounty whose target stands is not claimed and counts for nothing", () => {
    expect.hasAssertions();

    expect(claimWeeklyReputationBounty(CITY, { ...HUNT, isTargetDefeated: false }, [], now)).toBeUndefined();
  });
});
