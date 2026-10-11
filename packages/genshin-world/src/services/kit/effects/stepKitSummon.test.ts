import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { stepKitSummon } from "#src/services/kit/effects/stepKitSummon";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));
const COMBATANT: KitSummon["combatant"] = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
};
const HIT_AREA = { angle: 2 * Math.PI, height: 2, radius: 2.5 };

describe(stepKitSummon, () => {
  test("lands a hit at its cast in its first step, and only then", () => {
    expect.hasAssertions();
    const summon: KitSummon = {
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant: COMBATANT,
      elapsedSeconds: 0,
      hits: [{ hitArea: HIT_AREA, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: 1 }],
      kind: "summon",
      secondsRemaining: 1,
    };

    expect([
      stepKitSummon(summon, 0.5, { x: 0, z: 0 }).length,
      stepKitSummon(summon, 0.5, { x: 0, z: 0 }).length,
    ]).toStrictEqual([1, 0]);
  });

  test("lands a following summon's hits from where the body on the field stands on each step", () => {
    expect.hasAssertions();
    const summon: KitSummon = {
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant: COMBATANT,
      elapsedSeconds: 0,
      hits: [
        { hitArea: HIT_AREA, hitmarkSeconds: 0.5, poiseDamage: 30, talentMultiplier: 1 },
        { hitArea: HIT_AREA, hitmarkSeconds: 1.5, poiseDamage: 30, talentMultiplier: 1 },
      ],
      isFollowing: true,
      kind: "summon",
      secondsRemaining: 2,
    };
    const firstStrikes = stepKitSummon(summon, 1, { x: 3, z: 4 });

    expect(firstStrikes.map(({ body: { position } }) => position)).toStrictEqual([{ x: 3, z: 4 }]);

    const secondStrikes = stepKitSummon(summon, 1, { x: -2, z: 1 });

    expect(secondStrikes.map(({ body: { position } }) => position)).toStrictEqual([{ x: -2, z: 1 }]);
  });

  test("lands a hit whose hitmark is the cast on the first step only", () => {
    expect.hasAssertions();
    const hitArea = { angle: 2 * Math.PI, height: 2, radius: 2.5 };
    const summon: KitSummon = {
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant: {
        ascension: 0,
        attributes: computeCharacterAttributes([]),
        characterId: TRAVELER_CHARACTER_ID,
        constellationCount: 0,
        elementalResonances: [],
        kit: TRAVELER_KIT,
        level: 90,
      },
      elapsedSeconds: 0,
      hits: [{ hitArea, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: 1 }],
      kind: "summon",
      secondsRemaining: 2,
    };

    expect(stepKitSummon(summon, 1, { x: 0, z: 0 })).toHaveLength(1);
    expect(stepKitSummon(summon, 1, { x: 0, z: 0 })).toHaveLength(0);
  });
});
