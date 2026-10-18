import { KitEventKind } from "#src/models/kit/KitEventKind";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createNingguangKitBehaviour, NINGGUANG_CHARACTER_ID } from "#src/services/kit/characters/ningguangKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const NINGGUANG_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NINGGUANG_CHARACTER_ID);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
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
const stepEffects = (seconds: number, context: KitContext): KitStrike[] =>
  Array.from({ length: Math.round(seconds / FIXED_STEP_SECONDS) }, () =>
    stepKitTestEffects(FIXED_STEP_SECONDS, context),
  ).flat();

// Strikes an enemy with each strike, as the world does for an enemy within its area
const landStrikes = (strikes: KitStrike[], context: KitContext): void => {
  for (const strike of strikes) strike.hit.onStrike?.(context, strike);
};

describe(createNingguangKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createNingguangCombatant(0, 0));
    // The multipliers of the hits an action's start casts, as they land on an enemy over the 3 seconds after it
    const landStartedHits = (action: KitAction): number[] => {
      action.onStart?.(context);
      const strikes = stepEffects(3, context);
      landStrikes(strikes, context);
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
    const context = createKitTestContext(combatant, {
      party: createParty([NINGGUANG_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
    });
    // The Star Jades a charged attack fires, past its own gem
    const fireStarJades = (): number => {
      NINGGUANG_KIT.chargedAttack.onStart?.(context);
      return stepEffects(2, context).length - 1;
    };
    for (let index = 0; index < 4; index++) {
      takeOne(NINGGUANG_KIT.normalAttacks).onStart?.(context);
      landStrikes(stepEffects(1, context), context);
    }
    const firedCount = fireStarJades();
    takeOne(NINGGUANG_KIT.normalAttacks).onStart?.(context);
    landStrikes(stepEffects(1, context), context);
    // The swap emits Ningguang's leaving, as stepActiveKit does on a swap
    NINGGUANG_KIT.onKitEvent?.(
      {
        characterId: TRAVELER_CHARACTER_ID,
        kind: KitEventKind.CharacterSwapped,
        previousCharacterId: NINGGUANG_CHARACTER_ID,
      },
      { ...context, activeCombatant: travelerCombatant },
      combatant,
    );
    stepEffects(1, { ...context, activeCombatant: travelerCombatant });

    expect([firedCount, fireStarJades()]).toStrictEqual([3, 0]);
  });

  test("a strike gives one Star Jade as its two gems strike, and none as they strike nothing", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createNingguangCombatant(1, 0));
    takeOne(NINGGUANG_KIT.normalAttacks).onStart?.(context);
    const missedStrikes = stepEffects(1, context);
    const missedMultiplier = NINGGUANG_KIT.getChargedAttackStaminaMultiplier?.(context);
    takeOne(NINGGUANG_KIT.normalAttacks).onStart?.(context);
    landStrikes(stepEffects(1, context), context);
    NINGGUANG_KIT.chargedAttack.onStart?.(context);

    expect([missedStrikes.length, missedMultiplier]).toStrictEqual([2, 1]);
    expect(stepEffects(2, context)).toHaveLength(1 + 1);
  });

  test.each([
    [0, 1],
    [1, 0],
  ])(
    "at Ascension %i, a charged attack holding a Star Jade spends %i times its stamina, and all of it holding none",
    (ascension, multiplier) => {
      expect.hasAssertions();
      const context = createKitTestContext(createNingguangCombatant(ascension, 0));
      const emptyMultiplier = NINGGUANG_KIT.getChargedAttackStaminaMultiplier?.(context);
      takeOne(NINGGUANG_KIT.normalAttacks).onStart?.(context);
      landStrikes(stepEffects(1, context), context);

      expect(NINGGUANG_KIT.getChargedAttackStaminaMultiplier?.(context)).toBe(multiplier);
      expect(emptyMultiplier).toBe(1);
    },
  );

  test("starshatter shatters a standing Jade Screen into six more gems, priced as Ningguang stood when she cast it", () => {
    expect.hasAssertions();
    const castingCombatant = createNingguangCombatant(0, 0);
    const burstingCombatant: Combatant = { ...castingCombatant, level: 80 };
    const context = createKitTestContext(castingCombatant);
    NINGGUANG_KIT.elementalSkill.onStart?.(context);
    stepEffects(1, context);
    NINGGUANG_KIT.elementalBurst.onStart?.({ ...context, activeCombatant: burstingCombatant });
    const levels = stepEffects(3, context).map(({ combatant }) => combatant.level);

    expect(levels).toStrictEqual([80, 80, 80, 80, 80, 80, 90, 90, 90, 90, 90, 90]);
    expect(context.kitEffectState.effects).toStrictEqual([]);
  });

  test.each([
    [1, [12, 12, 12, 12]],
    [2, [12, 0, 12, 0]],
  ])(
    "at %i constellations, Jade Screen cast over a standing one a second apart, then 6 seconds on, leaves cooldowns %j",
    (constellationCount, expectedCooldowns) => {
      expect.hasAssertions();
      const context = createKitTestContext(createNingguangCombatant(0, constellationCount));
      const partyMember = getPartyMember(context.party, NINGGUANG_CHARACTER_ID);
      // The cooldown a cast leaves a second on: set as the skill starts, as the kit's step sets it, then the screen cast
      const cast = (waitSeconds: number): number => {
        stepEffects(waitSeconds, context);
        partyMember.skillCooldownSeconds = NINGGUANG_KIT.skillCooldownSeconds;
        NINGGUANG_KIT.elementalSkill.onStart?.(context);
        stepEffects(1, context);
        return partyMember.skillCooldownSeconds;
      };
      const cooldowns = [cast(0), cast(0), cast(0), cast(6)];

      expect(cooldowns).toStrictEqual(expectedCooldowns);
    },
  );

  test("at six constellations, Starshatter gives seven Star Jades, which a strike adds none to and a charged attack fires", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createNingguangCombatant(0, 6));
    NINGGUANG_KIT.elementalBurst.onStart?.(context);
    stepEffects(3, context);
    takeOne(NINGGUANG_KIT.normalAttacks).onStart?.(context);
    landStrikes(stepEffects(1, context), context);
    NINGGUANG_KIT.chargedAttack.onStart?.(context);
    const chargedAttackStrikes = stepEffects(2, context);

    expect(chargedAttackStrikes).toHaveLength(1 + 7);
  });
});
