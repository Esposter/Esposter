import type { Combatant } from "#src/models/kit/Combatant";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createJeanKitBehaviour, JEAN_CHARACTER_ID } from "#src/services/kit/characters/jeanKit";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { BARBARA_CHARACTER_ID } from "#src/services/kit/characters/barbaraKit";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { stepKit } from "#src/services/kit/stepKit";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const JEAN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, JEAN_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createJeanEnemy = (x: number, z: number): Enemy => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  position: { x, z },
});

describe(createJeanKitBehaviour, () => {
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
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(createJeanCombatant(0, 0), { kitEffectState });
    const partyMember = getPartyMember(context.party, JEAN_CHARACTER_ID);
    partyMember.healthShare = 0.1;
    JEAN_KIT.elementalBurst.onStart?.(context);

    // The activation, at 40 frames, heals by 251.2% of Jean's ATK plus 1540, and lands the entering damage of 78.4%
    const enteringStrikes = stepKitTestEffects(40 / 60, context);
    const activationHealthShare = 0.1 + (1540.3248 + 2.512 * BASE_ATTACK) / MAX_HEALTH;

    expect(partyMember.healthShare).toBeCloseTo(activationHealthShare, 4);

    // Ten regenerations, a second apart, each heal by 25.12% of her ATK plus 154, and the field's end lands the exiting
    // Damage, after which neither the field nor its damage stands
    const exitingStrikes = [...stepKitTestEffects(10, context), ...stepKitTestEffects(0.2, context)];

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
    const context = createKitTestContext(createJeanCombatant(ascension, 0));
    JEAN_KIT.elementalBurst.onStart?.(context);
    stepKitEffects(40 / 60, context);

    expect(getPartyMember(context.party, JEAN_CHARACTER_ID).energy).toBe(energy);
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

    expect(
      healKitParty(createKitTestContext(combatant, { party, random: () => 0.4 }), combatant, combatant, strike),
    ).toBe(isHealed);
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
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(createJeanCombatant(0, constellationCount), { kitEffectState });
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

  test("constellation 2 gives each party member 15% Movement SPD and ATK SPD for 15 seconds when Jean picks up a particle", () => {
    expect.hasAssertions();
    const combatant = createJeanCombatant(0, 2);
    const context = createKitTestContext(combatant, { party: createParty([JEAN_CHARACTER_ID, BARBARA_CHARACTER_ID]) });
    JEAN_KIT.onKitEvent?.(
      {
        characterId: JEAN_CHARACTER_ID,
        count: 1,
        energyDropKind: EnergyDropKind.Particle,
        kind: KitEventKind.EnergyParticleCollected,
      },
      context,
      combatant,
    );

    expect(
      context.kitEffectState.effects.flatMap((effect) =>
        effect.kind === "buff" ? [[effect.characterId, effect.attribute, effect.amount, effect.secondsRemaining]] : [],
      ),
    ).toStrictEqual([
      [JEAN_CHARACTER_ID, Attribute.MovementSpeed, 0.15, 15],
      [BARBARA_CHARACTER_ID, Attribute.MovementSpeed, 0.15, 15],
      [JEAN_CHARACTER_ID, Attribute.NormalAttackSpeed, 0.15, 15],
      [BARBARA_CHARACTER_ID, Attribute.NormalAttackSpeed, 0.15, 15],
    ]);
  });

  test("constellation 2 gives no party speed when another character picks up a particle", () => {
    expect.hasAssertions();
    const combatant = createJeanCombatant(0, 2);
    const context = {
      ...createKitTestContext(combatant, { party: createParty([JEAN_CHARACTER_ID, BARBARA_CHARACTER_ID]) }),
      activeCombatant: { ...combatant, characterId: BARBARA_CHARACTER_ID },
    };
    JEAN_KIT.onKitEvent?.(
      {
        characterId: BARBARA_CHARACTER_ID,
        count: 1,
        energyDropKind: EnergyDropKind.Particle,
        kind: KitEventKind.EnergyParticleCollected,
      },
      context,
      combatant,
    );

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });

  test("constellation 2 gives no party speed below Constellation 2", () => {
    expect.hasAssertions();
    const combatant = createJeanCombatant(0, 1);
    const context = createKitTestContext(combatant, { party: createParty([JEAN_CHARACTER_ID, BARBARA_CHARACTER_ID]) });
    JEAN_KIT.onKitEvent?.(
      {
        characterId: JEAN_CHARACTER_ID,
        count: 1,
        energyDropKind: EnergyDropKind.Particle,
        kind: KitEventKind.EnergyParticleCollected,
      },
      context,
      combatant,
    );

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });

  test("constellation 4 cuts the Anemo RES of each enemy inside Dandelion Breeze's field by 40%, and not of one outside it", () => {
    expect.hasAssertions();
    const combatant = createJeanCombatant(0, 4);
    const near = createJeanEnemy(1, 0);
    const far = createJeanEnemy(30, 0);
    const context = createKitTestContext(combatant, {
      enemyMap: new Map([
        ["near", near],
        ["far", far],
      ]),
    });
    JEAN_KIT.elementalBurst.onStart?.(context);
    stepKitEffects(1, context);

    expect(
      [near, far].map(({ statuses }) =>
        statuses.map(({ id, resistanceReduction }) => [id, resistanceReduction?.[Element.Anemo]]),
      ),
    ).toStrictEqual([[["jean-constellation-4", 0.4]], []]);
  });

  test("below Constellation 4, Dandelion Breeze's field cuts no enemy's Anemo RES", () => {
    expect.hasAssertions();
    const combatant = createJeanCombatant(0, 3);
    const enemy = createJeanEnemy(1, 0);
    const context = createKitTestContext(combatant, { enemyMap: new Map([["near", enemy]]) });
    JEAN_KIT.elementalBurst.onStart?.(context);
    stepKitEffects(1, context);

    expect(enemy.statuses).toStrictEqual([]);
  });
});
