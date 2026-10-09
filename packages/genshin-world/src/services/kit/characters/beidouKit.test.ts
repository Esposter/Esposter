import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { BEIDOU_CHARACTER_ID } from "#src/services/character/constants";
import { createBeidouKit } from "#src/services/kit/characters/beidouKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const BEIDOU_KIT = createBeidouKit(await readTalentMultipliers([BEIDOU_CHARACTER_ID]));

const createBeidouCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseAttack, value: 200 },
    { attribute: Attribute.BaseHealth, value: 10_000 },
  ]),
  characterId: BEIDOU_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: BEIDOU_KIT,
  level: 90,
});

describe(createBeidouKit, () => {
  const body = { x: 0, z: 0 };
  const kitBody = { facing: 0, height: 0, position: body };

  test("reads each talent multiplier from her proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const combatant = createBeidouCombatant(0);
    const party = createParty([BEIDOU_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    BEIDOU_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
    takeOne(BEIDOU_KIT.normalAttacks).onStart?.({ body: kitBody, combatant, kitEffectState });
    const discharges = stepKitEffects(kitEffectState, 1, { activeCombatant: combatant, body, party });
    const multipliers = [
      ...BEIDOU_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...BEIDOU_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      BEIDOU_KIT.plungeCollision.talentMultiplier,
      takeOne(BEIDOU_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(BEIDOU_KIT.highPlunge.hits).talentMultiplier,
      takeOne(BEIDOU_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(BEIDOU_KIT.elementalBurst.hits).talentMultiplier,
      ...discharges.map(({ hit }) => hit.talentMultiplier),
    ];
    const expectedMultipliers = [
      0.7112, 0.7086, 0.8832, 0.8652, 1.1214, 0.5624, 1.0182, 0.7459, 1.4914, 1.8629, 1.216, 1.216, 0.96,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("the skill's press sets an Electro shield of 14.4% of her Max HP plus 1386, standing until its hit", () => {
    expect.hasAssertions();
    const combatant = createBeidouCombatant(0);
    const party = createParty([BEIDOU_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    BEIDOU_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });

    expect(kitEffectState.effects).toStrictEqual([
      {
        characterId: BEIDOU_CHARACTER_ID,
        element: Element.Electro,
        health: 0.144 * 10_000 + 1386.3678,
        kind: "shield",
        secondsRemaining: 23 / 60,
      },
    ]);

    stepKitEffects(kitEffectState, 23 / 60, { activeCombatant: combatant, body, party });

    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("while the Targe stands, her strikes and charged attack discharge at most once a second, and none after it", () => {
    expect.hasAssertions();
    const combatant = createBeidouCombatant(0);
    const party = createParty([BEIDOU_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = { activeCombatant: combatant, body, party };
    const firstStrike = takeOne(BEIDOU_KIT.normalAttacks);
    BEIDOU_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
    firstStrike.onStart?.({ body: kitBody, combatant, kitEffectState });
    takeOne(BEIDOU_KIT.normalAttacks, 1).onStart?.({ body: kitBody, combatant, kitEffectState });
    const strikeDischarges = stepKitEffects(kitEffectState, 2, context);
    BEIDOU_KIT.chargedAttack.onStart?.({ body: kitBody, combatant, kitEffectState });
    const chargedAttackDischarges = stepKitEffects(kitEffectState, 2, context);
    // The Targe's 15 seconds run out, so a strike after them discharges nothing
    stepKitEffects(kitEffectState, 11, context);
    firstStrike.onStart?.({ body: kitBody, combatant, kitEffectState });

    expect(strikeDischarges.map(({ hit }) => [hit.element, hit.talentMultiplier])).toStrictEqual([
      [Element.Electro, 0.96],
    ]);
    expect(chargedAttackDischarges.map(({ hit }) => [hit.element, hit.talentMultiplier])).toStrictEqual([
      [Element.Electro, 0.96],
    ]);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test.each([
    [0, 0],
    [6, 30],
  ])(
    "with %i constellations, the Targe cuts the Electro RES round wherever the body on the field stands %i times",
    (constellationCount, tickCount) => {
      expect.hasAssertions();
      const combatant = createBeidouCombatant(constellationCount);
      const party = createParty([BEIDOU_CHARACTER_ID]);
      const kitEffectState: KitEffectState = { effects: [] };
      const movedBody = { x: 3, z: 4 };
      BEIDOU_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
      const ticks = stepKitEffects(kitEffectState, 15, { activeCombatant: combatant, body: movedBody, party });

      expect(ticks.map(({ body: { position }, hit }) => [position, hit.enemyStatus?.(combatant)])).toStrictEqual(
        Array.from({ length: tickCount }, () => [
          movedBody,
          {
            damageTakenBonus: 0,
            id: "beidou-bane-of-evil",
            resistanceReduction: { [Element.Electro]: 0.15 },
            secondsRemaining: 1.5,
          },
        ]),
      );
      expect(kitEffectState.effects).toStrictEqual([]);
    },
  );
});
