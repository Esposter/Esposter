import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { MONA_CHARACTER_ID } from "#src/services/character/constants";
import { MONA_KIT } from "#src/services/kit/characters/monaKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createMonaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: MONA_CHARACTER_ID,
  elementalResonances: [],
  kit: MONA_KIT,
  level: 90,
});

describe("mona kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...MONA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(MONA_KIT.chargedAttack.hits).talentMultiplier,
      MONA_KIT.plungeCollision.talentMultiplier,
      takeOne(MONA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(MONA_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.376, 0.36, 0.448, 0.5616, 1.4972, 0.5683, 1.1363, 1.4193];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("its Mirror Reflection lands four ticks and then its explosion, and ends with the explosion", () => {
    expect.hasAssertions();
    const combatant = createMonaCombatant();
    const party = createParty([MONA_CHARACTER_ID]);
    const body = { x: 0, z: 0 };
    const effects: KitEffect[] = [];
    MONA_KIT.elementalSkill.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, effects });

    // A single step past the explosion at 329 frames lands every hit of the summon, and the summon then ends
    const strikes = stepKitEffects(effects, 6, { activeCombatant: combatant, body, party });
    expect(strikes.map(({ hit }) => hit.talentMultiplier)).toStrictEqual([0.32, 0.32, 0.32, 0.32, 1.328]);
    expect(effects).toStrictEqual([]);
  });
});
