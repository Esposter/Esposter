import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NINGGUANG_CHARACTER_ID, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createNingguangKit } from "#src/services/kit/characters/ningguangKit";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const NINGGUANG_KIT = createNingguangKit(await readTalentMultipliers([NINGGUANG_CHARACTER_ID]));
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers([TRAVELER_CHARACTER_ID]));

const createNingguangCombatant = (ascension: number, constellationCount: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: NINGGUANG_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: NINGGUANG_KIT,
  level: 90,
});

// Runs the team's effects on at the world's fixed step for the given seconds, as the world steps them
const stepEffects = (
  kitEffectState: KitEffectState,
  seconds: number,
  context: Parameters<typeof stepKitEffects>[2],
): KitStrike[] =>
  Array.from({ length: Math.round(seconds / FIXED_STEP_SECONDS) }, () =>
    stepKitEffects(kitEffectState, FIXED_STEP_SECONDS, context),
  ).flat();

// Strikes an enemy with each strike, as the world does for an enemy within its area
const landStrikes = (strikes: KitStrike[], kitEffectState: KitEffectState): void => {
  for (const { body, combatant, hit } of strikes) hit.onStrike?.({ body, combatant, kitEffectState });
};

describe(createNingguangKit, () => {
  const body = { x: 0, z: 0 };
  const kitBody = { facing: 0, height: 0, position: body };

  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const combatant = createNingguangCombatant(0, 0);
    const context = { activeCombatant: combatant, body, party: createParty([NINGGUANG_CHARACTER_ID]) };
    const kitEffectState: KitEffectState = { effects: [] };
    // The multipliers of the hits an action's start casts, as they land on an enemy over the 3 seconds after it
    const landStartedHits = (action: KitAction): number[] => {
      action.onStart?.({ body: kitBody, combatant, kitEffectState });
      const strikes = stepEffects(kitEffectState, 3, context);
      landStrikes(strikes, kitEffectState);
      return strikes.map(({ hit }) => hit.talentMultiplier);
    };
    const multipliers = [
      ...landStartedHits(takeOne(NINGGUANG_KIT.normalAttacks)),
      ...landStartedHits(NINGGUANG_KIT.chargedAttack),
      NINGGUANG_KIT.plungeCollision.talentMultiplier,
      takeOne(NINGGUANG_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(NINGGUANG_KIT.highPlunge.hits).talentMultiplier,
      ...landStartedHits(NINGGUANG_KIT.elementalSkill),
      takeOne(landStartedHits(NINGGUANG_KIT.elementalBurst)),
    ];
    const expectedMultipliers = [0.28, 0.28, 1.7408, 0.496, 0.5683, 1.1363, 1.4193, 2.304, 0.8696];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("each strike gives a Star Jade up to three, a charged attack fires them, and leaving the field loses them", () => {
    expect.hasAssertions();
    const combatant = createNingguangCombatant(0, 0);
    const travelerCombatant: Combatant = { ...combatant, characterId: TRAVELER_CHARACTER_ID, kit: TRAVELER_KIT };
    const party = createParty([NINGGUANG_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    const context = { activeCombatant: combatant, body, party };
    const kitEffectState: KitEffectState = { effects: [] };
    const start = { body: kitBody, combatant, kitEffectState };
    // The Star Jades a charged attack fires, past its own gem
    const fireStarJades = (): number => {
      NINGGUANG_KIT.chargedAttack.onStart?.(start);
      return stepEffects(kitEffectState, 2, context).length - 1;
    };
    for (let index = 0; index < 4; index++) {
      takeOne(NINGGUANG_KIT.normalAttacks).onStart?.(start);
      landStrikes(stepEffects(kitEffectState, 1, context), kitEffectState);
    }
    const firedCount = fireStarJades();
    takeOne(NINGGUANG_KIT.normalAttacks).onStart?.(start);
    landStrikes(stepEffects(kitEffectState, 1, context), kitEffectState);
    stepEffects(kitEffectState, 1, { ...context, activeCombatant: travelerCombatant });

    expect([firedCount, fireStarJades()]).toStrictEqual([3, 0]);
  });

  test("a strike gives one Star Jade as its two gems strike, and none as they strike nothing", () => {
    expect.hasAssertions();
    const combatant = createNingguangCombatant(1, 0);
    const context = { activeCombatant: combatant, body, party: createParty([NINGGUANG_CHARACTER_ID]) };
    const kitEffectState: KitEffectState = { effects: [] };
    const start = { body: kitBody, combatant, kitEffectState };
    takeOne(NINGGUANG_KIT.normalAttacks).onStart?.(start);
    const missedStrikes = stepEffects(kitEffectState, 1, context);
    const missedMultiplier = NINGGUANG_KIT.getChargedAttackStaminaMultiplier?.(start);
    takeOne(NINGGUANG_KIT.normalAttacks).onStart?.(start);
    landStrikes(stepEffects(kitEffectState, 1, context), kitEffectState);
    NINGGUANG_KIT.chargedAttack.onStart?.(start);

    expect([missedStrikes.length, missedMultiplier]).toStrictEqual([2, 1]);
    expect(stepEffects(kitEffectState, 2, context)).toHaveLength(1 + 1);
  });

  test.each([
    [0, 1],
    [1, 0],
  ])(
    "at Ascension %i, a charged attack holding a Star Jade spends %i times its stamina, and all of it holding none",
    (ascension, multiplier) => {
      expect.hasAssertions();
      const combatant = createNingguangCombatant(ascension, 0);
      const context = { activeCombatant: combatant, body, party: createParty([NINGGUANG_CHARACTER_ID]) };
      const kitEffectState: KitEffectState = { effects: [] };
      const start = { body: kitBody, combatant, kitEffectState };
      const emptyMultiplier = NINGGUANG_KIT.getChargedAttackStaminaMultiplier?.(start);
      takeOne(NINGGUANG_KIT.normalAttacks).onStart?.(start);
      landStrikes(stepEffects(kitEffectState, 1, context), kitEffectState);

      expect(NINGGUANG_KIT.getChargedAttackStaminaMultiplier?.(start)).toBe(multiplier);
      expect(emptyMultiplier).toBe(1);
    },
  );

  test("starshatter shatters a standing Jade Screen into six more gems, priced as Ningguang stood when she cast it", () => {
    expect.hasAssertions();
    const castingCombatant = createNingguangCombatant(0, 0);
    const burstingCombatant: Combatant = { ...castingCombatant, level: 80 };
    const context = { activeCombatant: castingCombatant, body, party: createParty([NINGGUANG_CHARACTER_ID]) };
    const kitEffectState: KitEffectState = { effects: [] };
    NINGGUANG_KIT.elementalSkill.onStart?.({ body: kitBody, combatant: castingCombatant, kitEffectState });
    stepEffects(kitEffectState, 1, context);
    NINGGUANG_KIT.elementalBurst.onStart?.({ body: kitBody, combatant: burstingCombatant, kitEffectState });
    const levels = stepEffects(kitEffectState, 3, context).map(({ combatant }) => combatant.level);

    expect(levels).toStrictEqual([80, 80, 80, 80, 80, 80, 90, 90, 90, 90, 90, 90]);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test.each([
    [1, [12, 12, 12, 12]],
    [2, [12, 0, 12, 0]],
  ])(
    "at %i constellations, Jade Screen cast over a standing one a second apart, then 6 seconds on, leaves cooldowns %j",
    (constellationCount, expectedCooldowns) => {
      expect.hasAssertions();
      const combatant = createNingguangCombatant(0, constellationCount);
      const party = createParty([NINGGUANG_CHARACTER_ID]);
      const context = { activeCombatant: combatant, body, party };
      const kitEffectState: KitEffectState = { effects: [] };
      const partyMember = getPartyMember(party, NINGGUANG_CHARACTER_ID);
      // The cooldown a cast leaves a second on: set as the skill starts, as the kit's step sets it, then the screen cast
      const cast = (waitSeconds: number): number => {
        stepEffects(kitEffectState, waitSeconds, context);
        partyMember.skillCooldownSeconds = NINGGUANG_KIT.skillCooldownSeconds;
        NINGGUANG_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
        stepEffects(kitEffectState, 1, context);
        return partyMember.skillCooldownSeconds;
      };
      const cooldowns = [cast(0), cast(0), cast(0), cast(6)];

      expect(cooldowns).toStrictEqual(expectedCooldowns);
    },
  );

  test("at six constellations, Starshatter gives seven Star Jades, which a strike adds none to and a charged attack fires", () => {
    expect.hasAssertions();
    const combatant = createNingguangCombatant(0, 6);
    const context = { activeCombatant: combatant, body, party: createParty([NINGGUANG_CHARACTER_ID]) };
    const kitEffectState: KitEffectState = { effects: [] };
    const start = { body: kitBody, combatant, kitEffectState };
    NINGGUANG_KIT.elementalBurst.onStart?.(start);
    stepEffects(kitEffectState, 3, context);
    takeOne(NINGGUANG_KIT.normalAttacks).onStart?.(start);
    landStrikes(stepEffects(kitEffectState, 1, context), kitEffectState);
    NINGGUANG_KIT.chargedAttack.onStart?.(start);
    const chargedAttackStrikes = stepEffects(kitEffectState, 2, context);

    expect(chargedAttackStrikes).toHaveLength(1 + 7);
  });
});
