import type { ReputationCity } from "#src/models/reputation/ReputationCity";

import { claimReputationBounty } from "#src/services/reputation/claimReputationBounty";
import { describe, expect, test } from "vitest";

describe(claimReputationBounty, () => {
  const REWARD = { exp: 120, items: [{ count: 20_000, id: 202 }] };
  const CITY: ReputationCity = {
    bounties: [{ difficulty: "easy", id: 1, regionId: 101, reward: REWARD }],
    explores: [],
    levels: [],
    requests: [],
  };

  test("a bounty cannot be claimed before its target is defeated", () => {
    expect.hasAssertions();

    expect(claimReputationBounty(CITY, { bountyId: 1, isTargetDefeated: false, regionId: 101 })).toBeUndefined();
    expect(claimReputationBounty(CITY, { bountyId: 1, isTargetDefeated: true, regionId: 101 })).toStrictEqual(REWARD);
  });
});
