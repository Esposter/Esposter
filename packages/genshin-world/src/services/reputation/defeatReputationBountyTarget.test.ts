import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { defeatReputationBountyTarget } from "#src/services/reputation/defeatReputationBountyTarget";
import { describe, expect, test } from "vitest";

const HUNT: ReputationBountyHunt = {
  bountyId: 3,
  isTargetDefeated: false,
  regionId: 7,
  spawn: [100, 0, 200],
  targetEnemyKindId: EnemyKindId.HilichurlFighter,
};

describe(defeatReputationBountyTarget, () => {
  test("a defeat of the bounty's camp marks its target defeated", () => {
    expect.hasAssertions();

    expect(defeatReputationBountyTarget(HUNT, "reputation-bounty-3")).toStrictEqual({
      ...HUNT,
      isTargetDefeated: true,
    });
  });

  test("a defeat of another camp leaves the hunt as it was", () => {
    expect.hasAssertions();

    expect(defeatReputationBountyTarget(HUNT, "domain-1-2-0")).toStrictEqual(HUNT);
  });
});
