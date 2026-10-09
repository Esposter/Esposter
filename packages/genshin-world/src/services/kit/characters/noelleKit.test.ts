import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NOELLE_CHARACTER_ID } from "#src/services/character/constants";
import { createNoelleKit } from "#src/services/kit/characters/noelleKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const NOELLE_KIT = createNoelleKit(await readTalentMultipliers([NOELLE_CHARACTER_ID]));

const DEFENSE = 800;

const createNoelleCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.BaseDefense, value: DEFENSE },
  ]),
  characterId: NOELLE_CHARACTER_ID,
  elementalResonances: [],
  kit: NOELLE_KIT,
  level: 90,
});

describe("noelle kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...NOELLE_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...NOELLE_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      NOELLE_KIT.plungeCollision.talentMultiplier,
      takeOne(NOELLE_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(NOELLE_KIT.highPlunge.hits).talentMultiplier,
      takeOne(NOELLE_KIT.elementalSkill.hits).talentMultiplier,
      ...NOELLE_KIT.elementalBurst.hits.map(({ talentMultiplier }) => talentMultiplier),
    ];
    const expectedMultipliers = [
      0.7912, 0.7336, 0.8626, 1.1343, 0.5074, 0.9047, 0.7459, 1.4914, 1.8629, 1.2, 0.672, 0.928,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("its Breastplate shields her for 160% of her DEF plus 769 for 12 seconds", () => {
    expect.hasAssertions();
    const combatant = createNoelleCombatant();
    const effects: KitEffect[] = [];
    NOELLE_KIT.elementalSkill.onStart?.({
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant,
      effects,
    });
    expect(effects).toStrictEqual([
      {
        characterId: NOELLE_CHARACTER_ID,
        element: Element.Geo,
        health: 1.6 * combatant.attributes.defense + 769.7851,
        kind: "shield",
        secondsRemaining: 12,
      },
    ]);
  });

  test("its Sweeping Time infuses her attacks with Geo and adds 40% of her DEF to her ATK", () => {
    expect.hasAssertions();
    const combatant = createNoelleCombatant();
    const effects: KitEffect[] = [];
    NOELLE_KIT.elementalBurst.onStart?.({
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant,
      effects,
    });
    expect(effects).toStrictEqual([
      {
        amount: 0.4 * combatant.attributes.defense,
        attribute: Attribute.Attack,
        characterId: NOELLE_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 15 + 80 / 60,
      },
      { characterId: NOELLE_CHARACTER_ID, element: Element.Geo, kind: "infusion", secondsRemaining: 15 + 80 / 60 },
    ]);
  });
});
