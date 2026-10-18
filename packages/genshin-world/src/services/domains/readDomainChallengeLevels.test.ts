import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { readDomainChallengeLevels } from "#src/services/domains/readDomainChallengeLevels";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(readDomainChallengeLevels, () => {
  test("a level defeats as many enemies as its waves hold", async () => {
    expect.hasAssertions();

    const levels = Object.values(await readDomainChallengeLevels(GAME_DATA_LOCAL_BASE_URL)).flatMap((ranks) =>
      Object.values(ranks),
    );
    expect(
      levels.filter(
        ({ defeatTarget, waves }) => defeatTarget !== waves.flat().reduce((total, { count }) => total + count, 0),
      ),
    ).toStrictEqual([]);
  });

  test("no enemy's name opens with the wiki's wave separator", async () => {
    expect.hasAssertions();

    const names = Object.values(await readDomainChallengeLevels(GAME_DATA_LOCAL_BASE_URL))
      .flatMap((ranks) => Object.values(ranks))
      .flatMap(({ waves }) => waves.flat().map(({ name }) => name));
    expect(names.filter((name) => name.startsWith("/"))).toStrictEqual([]);
  });

  test("ridge watch's levels run from the lowest rank to the highest", async () => {
    expect.hasAssertions();

    expect(
      Object.values(takeOne(await readDomainChallengeLevels(GAME_DATA_LOCAL_BASE_URL), 13)).map(
        ({ defeatTarget, waves }) => ({
          defeatTarget,
          enemies: waves.flat().reduce((total, { count }) => total + count, 0),
        }),
      ),
    ).toStrictEqual([
      { defeatTarget: 10, enemies: 10 },
      { defeatTarget: 8, enemies: 8 },
      { defeatTarget: 10, enemies: 10 },
      { defeatTarget: 2, enemies: 2 },
    ]);
  });

  test("the trounce domain's every level fights Stormterror alone, untimed", async () => {
    expect.hasAssertions();

    expect(
      Object.values(takeOne(await readDomainChallengeLevels(GAME_DATA_LOCAL_BASE_URL), 1006)).map(
        ({ defeatTarget, timeLimitSeconds, waves }) => ({ defeatTarget, timeLimitSeconds, waves }),
      ),
    ).toStrictEqual(
      Array.from({ length: 6 }, () => ({
        defeatTarget: 1,
        timeLimitSeconds: Number.POSITIVE_INFINITY,
        waves: [[{ count: 1, enemyKindId: EnemyKindId.StormterrorDvalin, name: "Stormterror Dvalin" }]],
      })),
    );
  });
});
