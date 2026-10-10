import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { JEAN_CHARACTER_ID } from "#src/services/character/constants";
import { createJeanKit } from "#src/services/kit/characters/jeanKit";
import { createKitState } from "#src/services/kit/createKitState";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { stepKit } from "#src/services/kit/stepKit";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const JEAN_KIT = createJeanKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [JEAN_CHARACTER_ID]));

describe(createJeanKit, () => {
  const MAX_HEALTH = 10_000;

  const BASE_ATTACK = 200;

  const createJeanCombatant = (ascension: number, constellationCount: number): Combatant => ({
    ascension,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.BaseHealth, value: MAX_HEALTH },
      { attribute: Attribute.BaseAttack, value: BASE_ATTACK },
    ]),
    characterId: JEAN_CHARACTER_ID,
    constellationCount,
    elementalResonances: [],
    kit: JEAN_KIT,
    level: 90,
  });

  test("reads each talent multiplier from her proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...JEAN_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...JEAN_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      JEAN_KIT.plungeCollision.talentMultiplier,
      takeOne(JEAN_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(JEAN_KIT.highPlunge.hits).talentMultiplier,
      takeOne(JEAN_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(JEAN_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.4833, 0.4558, 0.6029, 0.6588, 0.7921, 1.6202, 0.6393, 1.2784, 1.5968, 2.92, 4.248];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("heals the character on Dandelion Breeze's field at its activation and each second after, and lands the field's entering and exiting damage", () => {
    expect.hasAssertions();
    const combatant = createJeanCombatant(0, 0);
    const party = createParty([JEAN_CHARACTER_ID]);
    const partyMember = getPartyMember(party, JEAN_CHARACTER_ID);
    partyMember.healthShare = 0.1;
    const body = { x: 0, z: 0 };
    const kitEffectState: KitEffectState = { effects: [] };
    JEAN_KIT.elementalBurst.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, kitEffectState });
    const context = { activeCombatant: combatant, body, party };

    // The activation, at 40 frames, heals by 251.2% of Jean's ATK plus 1540, and lands the entering damage of 78.4%
    const enteringStrikes = stepKitEffects(kitEffectState, 40 / 60, context);
    const activationHealthShare = 0.1 + (1540.3248 + 2.512 * BASE_ATTACK) / MAX_HEALTH;

    expect(partyMember.healthShare).toBeCloseTo(activationHealthShare, 4);

    // Ten regenerations, a second apart, each heal by 25.12% of her ATK plus 154, and the field's end lands the exiting
    // Damage, after which neither the field nor its damage stands
    const exitingStrikes = [
      ...stepKitEffects(kitEffectState, 10, context),
      ...stepKitEffects(kitEffectState, 0.2, context),
    ];

    expect(partyMember.healthShare).toBeCloseTo(
      activationHealthShare + (10 * (154.0325 + 0.2512 * BASE_ATTACK)) / MAX_HEALTH,
      4,
    );
    expect([...enteringStrikes, ...exitingStrikes].map(({ hit }) => [hit.element, hit.talentMultiplier])).toStrictEqual(
      [
        [Element.Anemo, 0.784],
        [Element.Anemo, 0.784],
      ],
    );
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test.each([
    [0, 0],
    [4, 16],
  ])("at Ascension %i, the field's activation gives Jean back %i energy", (ascension, energy) => {
    expect.hasAssertions();
    const combatant = createJeanCombatant(ascension, 0);
    const party = createParty([JEAN_CHARACTER_ID]);
    const body = { x: 0, z: 0 };
    const kitEffectState: KitEffectState = { effects: [] };
    JEAN_KIT.elementalBurst.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, kitEffectState });
    stepKitEffects(kitEffectState, 40 / 60, { activeCombatant: combatant, body, party });

    expect(getPartyMember(party, JEAN_CHARACTER_ID).energy).toBe(energy);
  });

  test.each([
    [0, false],
    [1, true],
  ])("at Ascension %i, Wind Companion's heal on her strikes rolls without a shield: %s", (ascension, isHealed) => {
    expect.hasAssertions();
    const combatant = createJeanCombatant(ascension, 0);
    const party = createParty([JEAN_CHARACTER_ID]);
    getPartyMember(party, JEAN_CHARACTER_ID).healthShare = 0.5;
    const strike = takeOne(takeOne(JEAN_KIT.normalAttacks).hits);

    expect(healKitParty(party, new Map([[JEAN_CHARACTER_ID, combatant]]), [], combatant, strike, () => 0.4)).toBe(
      isHealed,
    );
  });

  test.each([
    [0, []],
    [
      1,
      [
        {
          amount: 0.4,
          attribute: Attribute.AnemoDamageBonus,
          characterId: JEAN_CHARACTER_ID,
          kind: "buff",
          secondsRemaining: 46 / 60,
        },
      ],
    ],
  ])(
    "with %i constellations, Gale Blade held a second gives the Anemo DMG Bonus %j for its blast",
    (constellationCount, effects) => {
      expect.hasAssertions();
      const kitState = createKitState();
      const partyMember = createPartyMember();
      const stamina = createStamina(STAMINA_MAX);
      const landedHits: KitHit[] = [];
      const input: KitInput = {
        height: 0,
        isAttackHeld: false,
        isAttackPressed: false,
        isBurstPressed: false,
        isSkillHeld: true,
        isSkillPressed: false,
        locomotionState: LocomotionState.Idle,
      };
      const body = { facing: 0, height: 0, position: { x: 0, z: 0 } };
      const kitEffectState: KitEffectState = { effects: [] };
      const context = { body, combatant: createJeanCombatant(0, constellationCount), kitEffectState };
      for (let step = 0; step < 12; step++)
        stepKit(kitState, JEAN_KIT, input, partyMember, stamina, 0.1, landedHits, context);
      const action = stepKit(
        kitState,
        JEAN_KIT,
        { ...input, isSkillHeld: false },
        partyMember,
        stamina,
        0.1,
        landedHits,
        context,
      );
      action?.onStart?.(context);

      expect(action?.hits).toStrictEqual(JEAN_KIT.elementalSkill.hits);
      expect(kitEffectState.effects).toStrictEqual(effects);
    },
  );
});
