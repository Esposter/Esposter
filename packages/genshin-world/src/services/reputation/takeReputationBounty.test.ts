import type { ReputationCity } from "#src/models/reputation/ReputationCity";

import { takeReputationBounty } from "#src/services/reputation/takeReputationBounty";
import { describe, expect, test } from "vitest";

describe(takeReputationBounty, () => {
  const REWARD = { exp: 120, items: [{ count: 20_000, id: 202 }] };
  const CITY: ReputationCity = {
    bountyTargets: [{ difficulty: "HUNTING_DIFFICULTY_EASY", enemyKindIds: [20_101, 20_102] }],
    bounties: [{ difficulty: "HUNTING_DIFFICULTY_EASY", id: 1, regionId: 101, reward: REWARD }],
    explores: [],
    huntingRegions: [{ center: [10, 20, 30], id: 101, radius: 100 }],
    levels: [],
    requests: [],
  };

  test("a bounty's target spawns when the bounty is taken", () => {
    expect.hasAssertions();

    expect(takeReputationBounty(CITY, 2, 1, 0)).toStrictEqual({
      bountyId: 1,
      isTargetDefeated: false,
      regionId: 101,
      spawn: [10, 20, 30],
      targetEnemyKindId: 20_101,
    });
    expect(takeReputationBounty(CITY, 2, 1, 0.99)).toStrictEqual({
      bountyId: 1,
      isTargetDefeated: false,
      regionId: 101,
      spawn: [10, 20, 30],
      targetEnemyKindId: 20_102,
    });
    expect(takeReputationBounty(CITY, 1, 1, 0)).toBeUndefined();
  });
});
