import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NOELLE_CHARACTER_ID } from "#src/services/character/constants";
import { createNoelleKit } from "#src/services/kit/characters/noelleKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
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
  constellationCount: 0,
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
    const kitEffectState: KitEffectState = { effects: [] };
    NOELLE_KIT.elementalSkill.onStart?.({
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant,
      kitEffectState,
    });
    expect(kitEffectState.effects).toStrictEqual([
      {
        characterId: NOELLE_CHARACTER_ID,
        element: Element.Geo,
        health: 1.6 * combatant.attributes.defense + 769.7851,
        kind: "shield",
        secondsRemaining: 12,
      },
    ]);
  });

  test("its Sweeping Time converts her attacks to Geo and adds 40% of her DEF to her ATK", () => {
    expect.hasAssertions();
    const combatant = createNoelleCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    NOELLE_KIT.elementalBurst.onStart?.({
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant,
      kitEffectState,
    });
    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 0.4 * combatant.attributes.defense,
        attribute: Attribute.Attack,
        characterId: NOELLE_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 15 + 80 / 60,
      },
      {
        characterId: NOELLE_CHARACTER_ID,
        element: Element.Geo,
        isConverted: true,
        kind: "infusion",
        secondsRemaining: 15 + 80 / 60,
      },
    ]);
  });

  test("with I Got Your Back, Breastplate's heal is certain under Sweeping Time from one constellation, and at its chance otherwise", () => {
    expect.hasAssertions();
    const combatant = { ...createNoelleCombatant(), constellationCount: 1 };
    const sweepingTime: KitEffect = {
      characterId: combatant.characterId,
      element: Element.Geo,
      isConverted: true,
      kind: "infusion",
      secondsRemaining: 10,
    };
    const { healParty } = takeOne(NOELLE_KIT.elementalSkill.hits);

    expect(healParty?.chance(combatant, [sweepingTime])).toBe(1);
    expect(healParty?.chance(combatant, [])).toBeCloseTo(0.5, 5);
    expect(healParty?.chance({ ...combatant, constellationCount: 0 }, [sweepingTime])).toBeCloseTo(0.5, 5);
  });

  test("with To Be Cleaned, her shield explodes as it ends for 4 times her ATK of Geo, on the character on the field, from four constellations", () => {
    expect.hasAssertions();
    const castBody = { facing: 0, height: 0, position: { x: 10, z: 0 } };
    const fieldPosition = { x: -4, z: 7 };
    const party = createParty([NOELLE_CHARACTER_ID]);
    const explodeAfterShield = (constellationCount: number) => {
      const kitEffectState: KitEffectState = { effects: [] };
      const combatant = { ...createNoelleCombatant(), constellationCount };
      NOELLE_KIT.elementalSkill.onStart?.({ body: castBody, combatant, kitEffectState });
      // Breastplate lasts 12 seconds, so 13 seconds run it out
      return stepKitEffects(kitEffectState, 13, { activeCombatant: combatant, body: fieldPosition, party });
    };

    expect(explodeAfterShield(3)).toStrictEqual([]);
    const [explosion] = explodeAfterShield(4);
    expect(explosion?.hit.talentMultiplier).toBe(4);
    expect(explosion?.hit.element).toBe(Element.Geo);
    expect(explosion?.body.position).toStrictEqual({ x: -4, z: 7 });
  });

  test("recasting Breastplate ends the shield she holds, whose explosion goes off on the next step", () => {
    expect.hasAssertions();
    const body = { facing: 0, height: 0, position: { x: 0, z: 0 } };
    const combatant = { ...createNoelleCombatant(), constellationCount: 4 };
    const kitEffectState: KitEffectState = { effects: [] };
    NOELLE_KIT.elementalSkill.onStart?.({ body, combatant, kitEffectState });
    NOELLE_KIT.elementalSkill.onStart?.({ body, combatant, kitEffectState });
    const context = { activeCombatant: combatant, body: body.position, party: createParty([NOELLE_CHARACTER_ID]) };

    expect(stepKitEffects(kitEffectState, 0.1, context)).toHaveLength(1);
    expect(kitEffectState.effects).toHaveLength(1);
  });
});
