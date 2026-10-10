import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { BARBARA_CHARACTER_ID, RAZOR_CHARACTER_ID } from "#src/services/character/constants";
import { createRazorKit } from "#src/services/kit/characters/razorKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const RAZOR_KIT = createRazorKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [RAZOR_CHARACTER_ID]));

const createRazorCombatant = (ascension: number, constellationCount: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: 200 }]),
  characterId: RAZOR_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: RAZOR_KIT,
  level: 90,
});

describe(createRazorKit, () => {
  const body = { x: 0, z: 0 };
  const kitBody = { facing: 0, height: 0, position: body };

  test("reads each talent multiplier from his proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...RAZOR_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...RAZOR_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      RAZOR_KIT.plungeCollision.talentMultiplier,
      takeOne(RAZOR_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(RAZOR_KIT.highPlunge.hits).talentMultiplier,
      takeOne(RAZOR_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(takeOne(RAZOR_KIT.elementalSkillHolds ?? []).action.hits).talentMultiplier,
      takeOne(RAZOR_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.9592, 0.8263, 1.0331, 1.3605, 0.6254, 1.1309, 0.8205, 1.6406, 2.0492, 1.992, 2.952, 1.6,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("each press gives an Electro Sigil up to three, and the hold clears them into 5 energy each at its hit", () => {
    expect.hasAssertions();
    const combatant = createRazorCombatant(0, 0);
    const party = createParty([RAZOR_CHARACTER_ID]);
    const partyMember = getPartyMember(party, RAZOR_CHARACTER_ID);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = { activeCombatant: combatant, body, party };
    for (let press = 0; press < 4; press++)
      RAZOR_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });

    expect(kitEffectState.effects.flatMap((effect) => (effect.kind === "buff" ? [effect.amount] : []))).toStrictEqual([
      0.2 * 3,
    ]);

    takeOne(RAZOR_KIT.elementalSkillHolds ?? []).action.onStart?.({ body: kitBody, combatant, kitEffectState });
    stepKitEffects(kitEffectState, 54 / 60, context);

    expect(partyMember.energy).toBe(0);

    stepKitEffects(kitEffectState, 0.2, context);

    expect(partyMember.energy).toBe(15);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test.each([
    [0, 6],
    [1, 0],
  ])(
    "at Ascension %i, Lightning Fang's hit leaves the skill's cooldown at %i seconds",
    (ascension, cooldownSeconds) => {
      expect.hasAssertions();
      const combatant = createRazorCombatant(ascension, 0);
      const party = createParty([RAZOR_CHARACTER_ID]);
      const partyMember = getPartyMember(party, RAZOR_CHARACTER_ID);
      partyMember.skillCooldownSeconds = 6;
      const kitEffectState: KitEffectState = { effects: [] };
      RAZOR_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
      stepKitEffects(kitEffectState, 33 / 60, { activeCombatant: combatant, body, party });

      expect(partyMember.skillCooldownSeconds).toBe(cooldownSeconds);
    },
  );

  test("his burst clears the sigils into energy, and its Soul Companion strikes beside each strike until he leaves the field", () => {
    expect.hasAssertions();
    const combatant = createRazorCombatant(0, 0);
    const party = createParty([RAZOR_CHARACTER_ID, BARBARA_CHARACTER_ID]);
    const partyMember = getPartyMember(party, RAZOR_CHARACTER_ID);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = { activeCombatant: combatant, body, party };
    const firstStrike = takeOne(RAZOR_KIT.normalAttacks);
    RAZOR_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
    RAZOR_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
    RAZOR_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
    stepKitEffects(kitEffectState, 33 / 60, context);
    firstStrike.onStart?.({ body: kitBody, combatant, kitEffectState });
    const soulCompanionStrikes = stepKitEffects(kitEffectState, 1, context);

    expect(partyMember.energy).toBe(10);
    expect(soulCompanionStrikes.map(({ hit }) => [hit.element, hit.talentMultiplier])).toStrictEqual([
      [Element.Electro, 0.24 * takeOne(firstStrike.hits).talentMultiplier],
    ]);

    // Switching Barbara in ends the Wolf Within, so a strike after it casts no Soul Companion
    stepKitEffects(kitEffectState, 1 / 60, {
      ...context,
      activeCombatant: { ...combatant, characterId: BARBARA_CHARACTER_ID },
    });
    firstStrike.onStart?.({ body: kitBody, combatant, kitEffectState });

    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test.each([
    [0, 1],
    [1, 0.82],
  ])("at Ascension %i, the skill's cooldown is multiplied by %f", (ascension, cooldownMultiplier) => {
    expect.hasAssertions();
    const combatant = createRazorCombatant(ascension, 0);

    expect(RAZOR_KIT.getSkillCooldownMultiplier?.({ body: kitBody, combatant, kitEffectState: { effects: [] } })).toBe(
      cooldownMultiplier,
    );
  });

  test.each([
    [0, [], []],
    [
      6,
      [
        [Element.Electro, 1],
        [Element.Electro, 1],
      ],
      [0.2 * 2],
    ],
  ])(
    "with %i constellations, strikes 0, 1 and 11 seconds apart release the lightning %j and leave the sigils' Energy Recharge %j",
    (constellationCount, lightningStrikes, sigilEnergyRecharges) => {
      expect.hasAssertions();
      const combatant = createRazorCombatant(0, constellationCount);
      const party = createParty([RAZOR_CHARACTER_ID]);
      const kitEffectState: KitEffectState = { effects: [] };
      const context = { activeCombatant: combatant, body, party };
      const firstStrike = takeOne(RAZOR_KIT.normalAttacks);
      const strikes = [1, 10, 1].flatMap((stepSeconds) => {
        firstStrike.onStart?.({ body: kitBody, combatant, kitEffectState });
        return stepKitEffects(kitEffectState, stepSeconds, context);
      });

      expect(strikes.map(({ hit }) => [hit.element, hit.talentMultiplier])).toStrictEqual(lightningStrikes);
      expect(kitEffectState.effects.flatMap((effect) => (effect.kind === "buff" ? [effect.amount] : []))).toStrictEqual(
        sigilEnergyRecharges,
      );
    },
  );
});
