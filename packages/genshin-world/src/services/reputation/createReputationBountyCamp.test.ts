import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { HUNT } from "#src/services/reputation/constants.test";
import { createReputationBountyCamp } from "#src/services/reputation/createReputationBountyCamp";
import { describe, expect, test } from "vitest";

describe(createReputationBountyCamp, () => {
  test("a taken bounty's target stands at the hunt's spawn point, in the region it names", () => {
    expect.hasAssertions();

    expect(createReputationBountyCamp(HUNT, 40)).toStrictEqual({
      areaId: "7",
      id: "reputation-bounty-3",
      members: [
        { enemyKindId: EnemyKindId.HilichurlFighter, id: "0", level: 40, patrol: [], position: { x: 100, z: 200 } },
      ],
    });
  });
});
