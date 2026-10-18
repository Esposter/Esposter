import { createDomainArenaCamp } from "#src/services/domains/createDomainArenaCamp";
import { DOMAIN_CHALLENGE_LEVELS } from "#src/services/domains/domainChallengeLevels";
import { OUTCROP_CAMP_ENEMY_KIND_IDS } from "#src/services/leyLine/constants";
import { describe, expect, test } from "vitest";

describe(createDomainArenaCamp, () => {
  test("the arena camp holds every enemy of the wave it spawns", () => {
    expect.hasAssertions();

    const [wave] = DOMAIN_CHALLENGE_LEVELS[13][30].waves;
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
});
