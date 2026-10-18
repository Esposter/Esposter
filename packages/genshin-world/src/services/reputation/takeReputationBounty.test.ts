import type { ReputationCity } from "#src/models/reputation/ReputationCity";

import { takeReputationBounty } from "#src/services/reputation/takeReputationBounty";
import { describe, expect, test } from "vitest";

describe(takeReputationBounty, () => {
  const REWARD = { exp: 120, items: [{ count: 20_000, id: 202 }] };
  const CITY: ReputationCity = {
    bounties: [{ difficulty: "easy", id: 1, regionId: 101, reward: REWARD }],
    explores: [],
    levels: [],
    requests: [],
  };

  test("a bounty's target spawns when the bounty is taken", () => {
    expect.hasAssertions();

    expect(takeReputationBounty(CITY, 2, 1)).toStrictEqual({ bountyId: 1, isTargetDefeated: false, regionId: 101 });
    expect(takeReputationBounty(CITY, 1, 1)).toBeUndefined();
  });
});
