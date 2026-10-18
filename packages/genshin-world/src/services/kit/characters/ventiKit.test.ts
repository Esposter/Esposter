import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createVentiKitBehaviour, VENTI_CHARACTER_ID } from "#src/services/kit/characters/ventiKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const VENTI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, VENTI_CHARACTER_ID);
const createVentiCombatant = (ascension: number, constellationCount: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: 200 }]),
  characterId: VENTI_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: VENTI_KIT,
  level: 90,
});

describe(createVentiKitBehaviour, () => {
  test("reads each talent multiplier from his proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createVentiCombatant(0, 0));
    VENTI_KIT.elementalBurst.onStart?.(context);
    // The Stormeye's first tick lands at 106 frames, the next falling past 2 seconds
    const summonStrikes = stepKitTestEffects(2, context);
    const multipliers = [
      ...VENTI_KIT.normalAttacks.flatMap((action) => action.hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(VENTI_KIT.chargedAttack.hits).talentMultiplier,
      VENTI_KIT.plungeCollision.talentMultiplier,
      takeOne(VENTI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(VENTI_KIT.highPlunge.hits).talentMultiplier,
      takeOne(VENTI_KIT.elementalSkill.hits).talentMultiplier,
      ...summonStrikes.map(({ hit }) => hit.talentMultiplier),
      takeOne(takeOne(VENTI_KIT.elementalSkillHolds ?? []).action.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.2038, 0.2038, 0.4438, 0.5237, 0.2606, 0.2606, 0.5065, 0.7095, 1.24, 0.5683, 1.1363, 1.4193, 2.76, 0.376, 3.8,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test.each([
    [0, 0],
    [4, 15],
  ])(
    "at Ascension %i, the Stormeye lands its twenty ticks 5 metres ahead and leaves Venti %i energy once it ends",
    (ascension, energy) => {
      expect.hasAssertions();
      const context = createKitTestContext(createVentiCombatant(ascension, 0));
      const { kitEffectState, party } = context;
      const partyMember = getPartyMember(party, VENTI_CHARACTER_ID);
      VENTI_KIT.elementalBurst.onStart?.(context);
      const ticks = stepKitTestEffects(9.5, context);

      expect(partyMember.energy).toBe(0);

      stepKitEffects(0.2, context);

      expect(ticks.map(({ body: { position }, hit }) => [position, hit.element])).toStrictEqual(
        Array.from({ length: 20 }, () => [{ x: 0, z: -5 }, Element.Anemo]),
      );
      expect(partyMember.energy).toBe(energy);
      expect(kitEffectState.effects).toStrictEqual([]);
    },
  );

  test.each([
    [0, 0],
    [1, 2],
  ])(
    "with %i constellations, the aimed shot looses %i split arrows at the wiki's share of it",
    (constellationCount, arrowCount) => {
      expect.hasAssertions();
      const context = createKitTestContext(createVentiCombatant(0, constellationCount));
      VENTI_KIT.chargedAttack.onStart?.(context);
      const arrows = stepKitTestEffects(2, context);

      expect(arrows.map(({ hit }) => [hit.element, hit.talentMultiplier])).toStrictEqual(
        Array.from({ length: arrowCount }, () => [
          Element.Anemo,
          0.33 * takeOne(VENTI_KIT.chargedAttack.hits).talentMultiplier,
        ]),
      );
    },
  );

  test.each([
    [0, undefined, undefined],
    [
      2,
      {
        damageTakenBonus: 0,
        id: "venti-breeze-of-reminiscence",
        physicalResistanceReduction: 0.12,
        resistanceReduction: { [Element.Anemo]: 0.12 },
        secondsRemaining: 10,
      },
      undefined,
    ],
    [
      6,
      {
        damageTakenBonus: 0,
        id: "venti-breeze-of-reminiscence",
        physicalResistanceReduction: 0.12,
        resistanceReduction: { [Element.Anemo]: 0.12 },
        secondsRemaining: 10,
      },
      {
        damageTakenBonus: 0,
        id: "venti-storm-of-defiance",
        resistanceReduction: { [Element.Anemo]: 0.2 },
        secondsRemaining: 10,
      },
    ],
  ])(
    "with %i constellations, Skyward Sonnet and the Stormeye give each enemy they strike %j and %j",
    (constellationCount, skillStatus, burstStatus) => {
      expect.hasAssertions();
      const combatant = createVentiCombatant(0, constellationCount);
      const context = createKitTestContext(combatant);
      VENTI_KIT.elementalBurst.onStart?.(context);
      const strikes = stepKitTestEffects(2, context);

      expect(
        [takeOne(VENTI_KIT.elementalSkill.hits), ...strikes.map(({ hit }) => hit)].map(({ enemyStatus }) =>
          enemyStatus?.(combatant),
        ),
      ).toStrictEqual([skillStatus, burstStatus]);
    },
  );
});

describe("breeze of reminiscence", () => {
  test("from two constellations each Skyward Sonnet hit cuts the Anemo and Physical RES of the enemy it strikes by 12% for 10 seconds", () => {
    expect.hasAssertions();
    const status = VENTI_KIT.elementalSkill.hits[0]?.enemyStatus?.(createVentiCombatant(0, 2));
    expect({
      physicalResistanceReduction: status?.physicalResistanceReduction,
      resistanceReduction: status?.resistanceReduction,
      secondsRemaining: status?.secondsRemaining,
    }).toStrictEqual({
      physicalResistanceReduction: 0.12,
      resistanceReduction: { [Element.Anemo]: 0.12 },
      secondsRemaining: 10,
    });
  });

  test("below two constellations a Skyward Sonnet hit cuts no RES", () => {
    expect.hasAssertions();
    expect(VENTI_KIT.elementalSkill.hits[0]?.enemyStatus?.(createVentiCombatant(0, 1))).toBeUndefined();
  });
});
