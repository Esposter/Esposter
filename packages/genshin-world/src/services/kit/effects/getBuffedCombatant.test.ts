import type { KitEffect } from "#src/models/kit/KitEffect";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { DILUC_KIT } from "#src/services/kit/characters/dilucKit";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1;

describe(getBuffedCombatant, () => {
  test("adds a flat ATK buff to the attack and a damage bonus to its attribute, and ignores another character's buff", () => {
    expect.hasAssertions();
    const combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: 100 }]),
      characterId: CHARACTER_ID,
      elementalResonances: [],
      kit: DILUC_KIT,
      level: 90,
    };
    const effects: KitEffect[] = [
      { amount: 30, attribute: Attribute.Attack, characterId: CHARACTER_ID, kind: "buff", secondsRemaining: 1 },
      {
        amount: 0.2,
        attribute: Attribute.PyroDamageBonus,
        characterId: CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 1,
      },
      { amount: 0.5, attribute: Attribute.PyroDamageBonus, characterId: 2, kind: "buff", secondsRemaining: 1 },
    ];
    const buffed = getBuffedCombatant(combatant, effects);
    expect(buffed.attributes.attack).toBe(combatant.attributes.attack + 30);
    expect(buffed.attributes.attributeTotalMap[Attribute.PyroDamageBonus]).toBeCloseTo(0.2);
    expect(getBuffedCombatant(combatant, [])).toBe(combatant);
  });
});
