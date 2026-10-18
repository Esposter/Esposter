import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { computeBountyTrailEnds } from "#src/services/elementalSight/computeBountyTrailEnds";
import { createReputationBountyCamp } from "#src/services/reputation/createReputationBountyCamp";
import { describe, expect, test } from "vitest";

describe(computeBountyTrailEnds, () => {
  const HUNT: ReputationBountyHunt = {
    bountyId: 3,
    isTargetDefeated: false,
    regionId: 7,
    spawn: [100, 0, 200],
    targetEnemyKindId: EnemyKindId.HilichurlFighter,
  };

  test("A bounty with no placed target draws no trail", () => {
    expect.hasAssertions();

    expect(computeBountyTrailEnds([])).toStrictEqual([]);
  });

  test("a placed bounty target is the end its trail runs to, at its spawn point", () => {
    expect.hasAssertions();

    expect(computeBountyTrailEnds([createReputationBountyCamp(HUNT, 1)])).toStrictEqual([{ x: 100, z: 200 }]);
  });
});
