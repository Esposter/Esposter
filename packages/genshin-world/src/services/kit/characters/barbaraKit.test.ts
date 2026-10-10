import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { BARBARA_CHARACTER_ID, JEAN_CHARACTER_ID } from "#src/services/character/constants";
import { createBarbaraKit } from "#src/services/kit/characters/barbaraKit";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const BARBARA_KIT = createBarbaraKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [BARBARA_CHARACTER_ID]));

describe(createBarbaraKit, () => {
  const MAX_HEALTH = 10_000;
  const body = { x: 0, z: 0 };
  const createBarbaraCombatant = (constellationCount: number): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId: BARBARA_CHARACTER_ID,
    constellationCount,
    elementalResonances: [],
    kit: BARBARA_KIT,
    level: 90,
  });

  test("reads each talent multiplier from her proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...BARBARA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(BARBARA_KIT.chargedAttack.hits).talentMultiplier,
      BARBARA_KIT.plungeCollision.talentMultiplier,
      takeOne(BARBARA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(BARBARA_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.3784, 0.3552, 0.4104, 0.552, 1.6624, 0.5683, 1.1363, 1.4193];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("lands Let the Show Begin's two droplets, and its Melody Loop heals the character on the field as it starts and every 5 seconds, four times", () => {
    expect.hasAssertions();
    const combatant = createBarbaraCombatant(0);
    const party = createParty([BARBARA_CHARACTER_ID]);
    const partyMember = getPartyMember(party, BARBARA_CHARACTER_ID);
    partyMember.healthShare = 0.1;
    const kitEffectState: KitEffectState = { effects: [] };
    BARBARA_KIT.elementalSkill.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, kitEffectState });
    const context = { activeCombatant: combatant, body, party };
    const regenerationHealthShare = (385.18774 + 0.04 * MAX_HEALTH) / MAX_HEALTH;

    // Two seconds in, both droplets have landed and the loop has healed once as it started
    const dropletStrikes = stepKitEffects(kitEffectState, 2, context);

    expect(dropletStrikes.map(({ hit }) => [hit.element, hit.talentMultiplier])).toStrictEqual([
      [Element.Hydro, 0.584],
      [Element.Hydro, 0.584],
    ]);
    expect(partyMember.healthShare).toBeCloseTo(0.1 + regenerationHealthShare, 4);

    // Its three later heals fall 5, 10 and 15 seconds after the first, and the loop ends with the last
    stepKitEffects(kitEffectState, 18, context);

    expect(partyMember.healthShare).toBeCloseTo(0.1 + 4 * regenerationHealthShare, 4);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("her strikes heal the party only while her Melody Loop stands, and her charged attack four times as much", () => {
    expect.hasAssertions();
    const combatant = createBarbaraCombatant(0);
    const party = createParty([BARBARA_CHARACTER_ID]);
    const partyMember = getPartyMember(party, BARBARA_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    const characterIdCombatantMap = new Map([[BARBARA_CHARACTER_ID, combatant]]);
    const strike = takeOne(takeOne(BARBARA_KIT.normalAttacks).hits);
    const chargedAttack = takeOne(BARBARA_KIT.chargedAttack.hits);
    const kitEffectState: KitEffectState = { effects: [] };
    const hitHealthShare = (72.2227 + 0.0075 * MAX_HEALTH) / MAX_HEALTH;

    expect(healKitParty(party, characterIdCombatantMap, [], combatant, strike, () => 0)).toBe(false);

    BARBARA_KIT.elementalSkill.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, kitEffectState });
    const isStrikeHealed = healKitParty(
      party,
      characterIdCombatantMap,
      kitEffectState.effects,
      combatant,
      strike,
      () => 0.99,
    );
    const isChargedAttackHealed = healKitParty(
      party,
      characterIdCombatantMap,
      kitEffectState.effects,
      combatant,
      chargedAttack,
      () => 0.99,
    );

    expect([isStrikeHealed, isChargedAttackHealed]).toStrictEqual([true, true]);
    expect(partyMember.healthShare).toBeCloseTo(0.5 + 5 * hitHealthShare, 5);
  });

  test("her burst heals the character on the field once, at 77 frames, and its field is no Melody Loop", () => {
    expect.hasAssertions();
    const combatant = createBarbaraCombatant(0);
    const party = createParty([BARBARA_CHARACTER_ID]);
    const partyMember = getPartyMember(party, BARBARA_CHARACTER_ID);
    partyMember.healthShare = 0.1;
    const kitEffectState: KitEffectState = { effects: [] };
    BARBARA_KIT.elementalBurst.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, kitEffectState });
    const context = { activeCombatant: combatant, body, party };
    stepKitEffects(kitEffectState, 76 / 60, context);

    expect(partyMember.healthShare).toBe(0.1);
    expect(
      healKitParty(
        party,
        new Map([[BARBARA_CHARACTER_ID, combatant]]),
        kitEffectState.effects,
        combatant,
        takeOne(takeOne(BARBARA_KIT.normalAttacks).hits),
        () => 0,
      ),
    ).toBe(false);

    stepKitEffects(kitEffectState, 1, context);

    expect(partyMember.healthShare).toBeCloseTo(0.1 + (1694.2819 + 0.176 * MAX_HEALTH) / MAX_HEALTH, 4);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test.each([
    [0, 1, []],
    [
      2,
      0.85,
      [
        {
          amount: 0.15,
          attribute: Attribute.HydroDamageBonus,
          characterId: JEAN_CHARACTER_ID,
          kind: "buff",
          secondsRemaining: 15 + 1 / 60,
        },
      ],
    ],
  ])(
    "with %i constellations, her skill's cooldown is multiplied by %f and its Melody Loop gives the Hydro DMG Bonuses %j",
    (constellationCount, cooldownMultiplier, buffs) => {
      expect.hasAssertions();
      const combatant = createBarbaraCombatant(constellationCount);
      const party = createParty([BARBARA_CHARACTER_ID, JEAN_CHARACTER_ID]);
      const kitEffectState: KitEffectState = { effects: [] };
      const kitBody = { facing: 0, height: 0, position: body };
      BARBARA_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
      stepKitEffects(kitEffectState, 3 / 60, { activeCombatant: combatant, body, party });

      expect(BARBARA_KIT.getSkillCooldownMultiplier?.({ body: kitBody, combatant, kitEffectState })).toBe(
        cooldownMultiplier,
      );
      expect(kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual(buffs);
    },
  );
});
