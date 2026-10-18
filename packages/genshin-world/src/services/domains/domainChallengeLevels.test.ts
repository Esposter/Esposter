import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { DOMAIN_CHALLENGE_LEVELS } from "#src/services/domains/domainChallengeLevels";
import { describe, expect, test } from "vitest";

describe("domain challenge levels", () => {
  test("a level defeats as many enemies as its waves hold", () => {
    expect.hasAssertions();

    const levels = Object.values(DOMAIN_CHALLENGE_LEVELS).flatMap((ranks) => Object.values(ranks));
    expect(
      levels.filter(
        ({ defeatTarget, waves }) => defeatTarget !== waves.flat().reduce((total, { count }) => total + count, 0),
      ),
    ).toStrictEqual([]);
  });

  test("ridge watch's levels run from the lowest rank to the highest", () => {
    expect.hasAssertions();

    expect(
      Object.values(DOMAIN_CHALLENGE_LEVELS[13]).map(({ defeatTarget, waves }) => ({
        defeatTarget,
        enemies: waves.flat().reduce((total, { count }) => total + count, 0),
      })),
    ).toStrictEqual([
      { defeatTarget: 10, enemies: 10 },
      { defeatTarget: 8, enemies: 8 },
      { defeatTarget: 10, enemies: 10 },
      { defeatTarget: 2, enemies: 2 },
    ]);
  });

  test("the trounce domain's every level fights Stormterror alone, untimed", () => {
    expect.hasAssertions();

    expect(
      Object.values(DOMAIN_CHALLENGE_LEVELS[1006]).map(({ defeatTarget, timeLimitSeconds, waves }) => ({
        defeatTarget,
        timeLimitSeconds,
        waves,
      })),
    ).toStrictEqual(
      Array.from({ length: 6 }, () => ({
        defeatTarget: 1,
        timeLimitSeconds: Number.POSITIVE_INFINITY,
        waves: [[{ count: 1, enemyKindId: EnemyKindId.StormterrorDvalin, name: "Stormterror Dvalin" }]],
      })),
    );
  });
});
