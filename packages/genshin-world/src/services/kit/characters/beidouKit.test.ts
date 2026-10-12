import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { BEIDOU_CHARACTER_ID, createBeidouKitBehaviour } from "#src/services/kit/characters/beidouKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const BEIDOU_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, BEIDOU_CHARACTER_ID);

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

describe(createBeidouKitBehaviour, () => {
  test("reads each talent multiplier from her proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createBeidouCombatant(0));
    BEIDOU_KIT.elementalBurst.onStart?.(context);
    takeOne(BEIDOU_KIT.normalAttacks).onStart?.(context);
    const discharges = stepKitTestEffects(1, context);
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
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(createBeidouCombatant(0), { kitEffectState });
    BEIDOU_KIT.elementalSkill.onStart?.(context);

    expect(kitEffectState.effects).toStrictEqual([
      {
        characterId: BEIDOU_CHARACTER_ID,
        element: Element.Electro,
        health: 0.144 * 10_000 + 1386.3678,
        kind: "shield",
        secondsRemaining: 23 / 60,
      },
    ]);

    stepKitEffects(23 / 60, context);

    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("while the Targe stands, her strikes and charged attack discharge at most once a second, and none after it", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(createBeidouCombatant(0), { kitEffectState });
    const firstStrike = takeOne(BEIDOU_KIT.normalAttacks);
    BEIDOU_KIT.elementalBurst.onStart?.(context);
    firstStrike.onStart?.(context);
    takeOne(BEIDOU_KIT.normalAttacks, 1).onStart?.(context);
    const strikeDischarges = stepKitTestEffects(2, context);
    BEIDOU_KIT.chargedAttack.onStart?.(context);
    const chargedAttackDischarges = stepKitTestEffects(2, context);
    // The Targe's 15 seconds run out, so a strike after them discharges nothing
    stepKitEffects(11, context);
    firstStrike.onStart?.(context);

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
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(combatant, { kitEffectState });
      const movedBody = { x: 3, z: 4 };
      BEIDOU_KIT.elementalBurst.onStart?.(context);
      context.body = { facing: 0, height: 0, position: movedBody };
      const ticks = stepKitTestEffects(15, context);

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
