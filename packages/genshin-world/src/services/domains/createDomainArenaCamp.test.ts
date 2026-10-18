import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { createDomainArenaCamp } from "#src/services/domains/createDomainArenaCamp";
import { DOMAIN_CHALLENGE_LEVELS } from "#src/services/domains/domainChallengeLevels";
import { OUTCROP_CAMP_ENEMY_KIND_IDS } from "#src/services/leyLine/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(createDomainArenaCamp, () => {
  test("the arena camp holds every enemy of the wave it spawns", () => {
    expect.hasAssertions();

    const wave = takeOne(takeOne(takeOne(DOMAIN_CHALLENGE_LEVELS, 13), 30).waves);
    const camp = createDomainArenaCamp("starfell-valley", "domain-13-1-0", { x: 0, z: 0 }, wave, 60, () => 0);
    expect(
      camp.members.map(({ enemyKindId, id, level: memberLevel }) => ({ enemyKindId, id, level: memberLevel })),
    ).toStrictEqual(
      Array.from({ length: 5 }, (_, index) => ({
        enemyKindId: OUTCROP_CAMP_ENEMY_KIND_IDS[0],
        id: String(index),
        level: 60,
      })),
    );
  });

  test("a wave that names its boss kind spawns that kind rather than a stand-in", () => {
    expect.hasAssertions();

    const camp = createDomainArenaCamp(
      "starfell-valley",
      "domain-1006-1-0",
      { x: 0, z: 0 },
      [{ count: 1, enemyKindId: EnemyKindId.StormterrorDvalin, name: "Stormterror Dvalin" }],
      60,
      () => 0,
    );
    expect(camp.members.map(({ enemyKindId }) => enemyKindId)).toStrictEqual([EnemyKindId.StormterrorDvalin]);
  });
});
