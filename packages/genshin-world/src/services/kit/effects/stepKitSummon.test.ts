import type { KitSummon } from "#src/models/kit/KitSummon";

import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { stepKitSummon } from "#src/services/kit/effects/stepKitSummon";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers([TRAVELER_CHARACTER_ID]));

describe(stepKitSummon, () => {
  test("lands a following summon's hits from where the body on the field stands on each step", () => {
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
      hits: [
        { hitArea, hitmarkSeconds: 0.5, poiseDamage: 30, talentMultiplier: 1 },
        { hitArea, hitmarkSeconds: 1.5, poiseDamage: 30, talentMultiplier: 1 },
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
});
