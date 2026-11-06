import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";

import { claimReputationBounty } from "#src/services/reputation/claimReputationBounty";
import { describe, expect, test } from "vitest";

describe(claimReputationBounty, () => {
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
    isTargetDefeated: false,
    regionId: 101,
    spawn: [0, 0, 0],
    targetEnemyKindId: 20_101,
  };

  test("a bounty cannot be claimed before its target is defeated", () => {
    expect.hasAssertions();

    expect(claimReputationBounty(CITY, HUNT)).toBeUndefined();
    expect(claimReputationBounty(CITY, { ...HUNT, isTargetDefeated: true })).toStrictEqual(REWARD);
  });
});
