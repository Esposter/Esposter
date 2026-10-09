import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { VENTI_CHARACTER_ID } from "#src/services/character/constants";
import { createVentiKit } from "#src/services/kit/characters/ventiKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const VENTI_KIT = createVentiKit(await readTalentMultipliers([VENTI_CHARACTER_ID]));

const createVentiCombatant = (ascension: number, constellationCount: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: 200 }]),
  characterId: VENTI_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: VENTI_KIT,
  level: 90,
});

describe(createVentiKit, () => {
  const body = { x: 0, z: 0 };
  const kitBody = { facing: 0, height: 0, position: body };

  test("reads each talent multiplier from his proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const combatant = createVentiCombatant(0, 0);
    const party = createParty([VENTI_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    VENTI_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
    VENTI_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
    // The press's Wind Domain lands at 51 frames and the Stormeye's first tick at 106, the next falling past 2 seconds
    const summonStrikes = stepKitEffects(kitEffectState, 2, { activeCombatant: combatant, body, party });
    const multipliers = [
      ...VENTI_KIT.normalAttacks.flatMap((action) => action.hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(VENTI_KIT.chargedAttack.hits).talentMultiplier,
      VENTI_KIT.plungeCollision.talentMultiplier,
      takeOne(VENTI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(VENTI_KIT.highPlunge.hits).talentMultiplier,
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
      const combatant = createVentiCombatant(ascension, 0);
      const party = createParty([VENTI_CHARACTER_ID]);
      const partyMember = getPartyMember(party, VENTI_CHARACTER_ID);
      const kitEffectState: KitEffectState = { effects: [] };
      const context = { activeCombatant: combatant, body, party };
      VENTI_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
      const ticks = stepKitEffects(kitEffectState, 9.5, context);

      expect(partyMember.energy).toBe(0);

      stepKitEffects(kitEffectState, 0.2, context);

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
      const combatant = createVentiCombatant(0, constellationCount);
      const party = createParty([VENTI_CHARACTER_ID]);
      const kitEffectState: KitEffectState = { effects: [] };
      VENTI_KIT.chargedAttack.onStart?.({ body: kitBody, combatant, kitEffectState });
      const arrows = stepKitEffects(kitEffectState, 2, { activeCombatant: combatant, body, party });

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
      const party = createParty([VENTI_CHARACTER_ID]);
      const kitEffectState: KitEffectState = { effects: [] };
      VENTI_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
      VENTI_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
      const strikes = stepKitEffects(kitEffectState, 2, { activeCombatant: combatant, body, party });

      expect(strikes.map(({ hit }) => hit.enemyStatus?.(combatant))).toStrictEqual([skillStatus, burstStatus]);
    },
  );
});
