import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { DILUC_CHARACTER_ID } from "#src/services/character/constants";
import { DILUC_KIT } from "#src/services/kit/characters/dilucKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createCombatant = (ascension: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([]),
  characterId: DILUC_CHARACTER_ID,
  elementalResonances: [],
  kit: DILUC_KIT,
  level: 90,
});

describe("diluc kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...DILUC_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...DILUC_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      DILUC_KIT.plungeCollision.talentMultiplier,
      takeOne(DILUC_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(DILUC_KIT.highPlunge.hits).talentMultiplier,
      takeOne(DILUC_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(DILUC_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.897, 0.876, 0.988, 1.34, 0.688, 1.247, 0.895, 1.79, 2.2355, 0.944, 2.04];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("infuses Pyro for 8 seconds with the burst, and for 12 with A4, which also gives a 20% Pyro damage bonus", () => {
    expect.hasAssertions();
    const body = { facing: 0, height: 0, position: { x: 0, z: 0 } };
    const effects: KitEffect[] = [];
    DILUC_KIT.elementalBurst.onStart?.({ body, combatant: createCombatant(3), effects });
    expect(effects).toStrictEqual([
      { characterId: DILUC_CHARACTER_ID, element: Element.Pyro, kind: "infusion", secondsRemaining: 8 },
    ]);

    effects.length = 0;
    DILUC_KIT.elementalBurst.onStart?.({ body, combatant: createCombatant(4), effects });
    expect(effects).toStrictEqual([
      { characterId: DILUC_CHARACTER_ID, element: Element.Pyro, kind: "infusion", secondsRemaining: 12 },
      {
        amount: 0.2,
        attribute: Attribute.PyroDamageBonus,
        characterId: DILUC_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 12,
      },
    ]);
  });
});
