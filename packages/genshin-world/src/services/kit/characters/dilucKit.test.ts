import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitState } from "#src/models/kit/KitState";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createDilucKitBehaviour, DILUC_CHARACTER_ID } from "#src/services/kit/characters/dilucKit";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { stepKitSummon } from "#src/services/kit/effects/stepKitSummon";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { stepKit } from "#src/services/kit/stepKit";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const DILUC_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, DILUC_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

// A party member losing a tenth of its Max HP, as an enemy's strike, a drown or a wildlife's charge takes it, or as a kit
// Of the team takes it when it names its own source
const createHealthLossEvent = (characterId: number, sourceCharacterId?: number): KitHealthChangedEvent => ({
  characterId,
  healthShare: -0.1,
  bondOfLifeShare: 0,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
  ...(sourceCharacterId === undefined ? {} : { sourceCharacterId }),
});
// The bonus the team's buffs give an attribute as they stand
const getAttributeBonus = (kitEffectState: KitEffectState, attribute: Attribute): number =>
  kitEffectState.effects.reduce(
    (total, effect) => (effect.kind === "buff" && effect.attribute === attribute ? total + effect.amount : total),
    0,
  );

describe(createDilucKitBehaviour, () => {
  const DILUC_COMBATANT: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: DILUC_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: DILUC_KIT,
    level: 90,
  };

  const createCombatant = (ascension: number): Combatant => ({
    ascension,
    attributes: computeCharacterAttributes([]),
    characterId: DILUC_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: DILUC_KIT,
    level: 90,
  });

  // The strike-damage bonus a Diluc strike takes on an enemy at the given share of its HP, with the constellations held
  const getDamageBonus = (constellationCount: number, healthShare: number): number | undefined => {
    const combatant = { ...createCombatant(0), constellationCount };
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    return DILUC_KIT.getStrikeDamageBonus?.(
      { body: createKitTestContext(combatant).body, combatant, hit: takeOne(takeOne(DILUC_KIT.normalAttacks).hits) },
      { ...enemy, health: healthShare * enemy.maxHealth },
      createParty([DILUC_CHARACTER_ID]),
    );
  };

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();

    expect(getDamageBonus(1, 0.6)).toBe(0.15);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();

    expect(getDamageBonus(0, 0.6)).toBe(0);
  });

  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...DILUC_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...DILUC_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      DILUC_KIT.plungeCollision.talentMultiplier,
      takeOne(DILUC_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(DILUC_KIT.highPlunge.hits).talentMultiplier,
      takeOne(DILUC_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(DILUC_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.897, 0.876, 0.988, 1.34, 0.688, 1.247, 0.895, 1.79, 2.2355, 0.944, 2.04];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("the Ascension 4 passive, Blessing of Phoenix, takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    DILUC_KIT.elementalBurst.onStart?.(createKitTestContext(createCombatant(4), { kitEffectState }));
    expect(kitEffectState.effects.filter(({ kind }) => kind !== "summon")).toStrictEqual([
      { characterId: DILUC_CHARACTER_ID, element: Element.Pyro, kind: "infusion", secondsRemaining: 12 },
      {
        amount: 0.2,
        attribute: Attribute.PyroDamageBonus,
        characterId: DILUC_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 12,
      },
    ]);
  });

  test("the Ascension 4 passive, Blessing of Phoenix, does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    DILUC_KIT.elementalBurst.onStart?.(createKitTestContext(createCombatant(3), { kitEffectState }));
    expect(kitEffectState.effects.filter(({ kind }) => kind !== "summon")).toStrictEqual([
      { characterId: DILUC_CHARACTER_ID, element: Element.Pyro, kind: "infusion", secondsRemaining: 8 },
    ]);
  });

  test("the Ascension 1 passive, Relentless, takes effect at its ascension phase", () => {
    expect.hasAssertions();
    expect(DILUC_KIT.getChargedAttackStaminaMultiplier?.(createKitTestContext(createCombatant(1)))).toBe(0.5);
  });

  test("the Ascension 1 passive, Relentless, does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    expect(DILUC_KIT.getChargedAttackStaminaMultiplier?.(createKitTestContext(createCombatant(0)))).toBe(1);
  });

  const STEP_SECONDS = 0.1;
  const IDLE_INPUT: KitInput = {
    height: 0,
    isAttackHeld: false,
    isAttackPressed: false,
    isBurstPressed: false,
    isSkillHeld: false,
    isSkillPressed: false,
    locomotionState: LocomotionState.Idle,
  };
  const createFixture = () => {
    const kitState: KitState = createKitState();
    const partyMember = createPartyMember();
    const stamina = createStamina(STAMINA_MAX);
    const step = (isSkillPressed = false) => {
      const landedHits: never[] = [];
      return stepKit(
        kitState,
        DILUC_KIT,
        { ...IDLE_INPUT, isSkillPressed },
        partyMember,
        stamina,
        STEP_SECONDS,
        landedHits,
        createKitTestContext(DILUC_COMBATANT),
      );
    };
    // Steps with no press until the action playing has run its seconds
    const playOut = () => {
      for (let index = 0; index < 100 && kitState.action; index++) step();
    };
    // Steps with no press for the given seconds
    const wait = (seconds: number) => {
      for (let index = 0; index < Math.round(seconds / STEP_SECONDS); index++) step();
    };
    return { partyMember, playOut, step, wait };
  };

  test("searing onslaught plays its three presses in a row, each within the window of the one before, and starts the cooldown on the first", () => {
    expect.hasAssertions();
    const { partyMember, playOut, step, wait } = createFixture();
    expect(step(true)).toBe(DILUC_KIT.elementalSkill);
    expect(partyMember.skillCooldownSeconds).toBe(DILUC_KIT.skillCooldownSeconds);
    playOut();
    wait(0.5);
    expect(step(true)).toBe(takeOne(DILUC_KIT.elementalSkillChain?.followUps ?? []));
    playOut();
    wait(0.5);
    expect(step(true)).toBe(DILUC_KIT.elementalSkillChain?.followUps[1]);
    playOut();
    // The third press closes the chain, and the cooldown still holds the next first press back
    wait(0.5);
    expect(step(true)).toBeUndefined();
  });

  test("searing onslaught does not chain a press once its window has lapsed, and the cooldown holds the next first press", () => {
    expect.hasAssertions();
    const { partyMember, playOut, step, wait } = createFixture();
    expect(step(true)).toBe(DILUC_KIT.elementalSkill);
    playOut();
    wait(4.1);
    expect(step(true)).toBeUndefined();
    expect(partyMember.skillCooldownSeconds).toBeGreaterThan(0);
  });

  test("dawn's phoenix launches at the slash, travels 14 metres a second from a metre ahead, and explodes 24.8 metres on", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCombatant(0));
    DILUC_KIT.elementalBurst.onStart?.(context);
    const phoenix = takeOne(
      context.kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon"),
    );
    expect(phoenix.body.position.z).toBeCloseTo(-1, 5);

    const FRAME_SECONDS = 1 / 60;
    const explosionHits: number[] = [];
    const tickHits: number[] = [];
    for (let frame = 0; frame < 230; frame++) {
      const strikes: KitStrike[] = [];
      stepKitSummon(phoenix, FRAME_SECONDS, { x: 0, z: 0 }, strikes);
      for (const { hit } of strikes)
        if (hit.hitArea.radius === 9.4) explosionHits.push(frame);
        else tickHits.push(frame);
    }
    // Eight ticks, from the 12th frame after the slash's 100th, and the explosion at 202 frames
    expect(tickHits).toHaveLength(8);
    expect(explosionHits).toHaveLength(1);
    expect(phoenix.body.position.z).toBeLessThan(-24);
  });

  const OTHER_CHARACTER_ID = 10_000_049;
  // Constellation 2's hook on a hit of Diluc's that costs him HP, with the team's effects it keeps
  const createConstellation2Fixture = () => {
    const combatant: Combatant = { ...createCombatant(0), constellationCount: 2 };
    const { kitEffectState } = createKitTestContext(combatant);
    const context = createKitTestContext(combatant, { kitEffectState });
    const takeHit = (characterId = DILUC_CHARACTER_ID, sourceCharacterId?: number) =>
      DILUC_KIT.onKitEvent?.(createHealthLossEvent(characterId, sourceCharacterId), context, combatant);
    return { combatant, kitEffectState, context, takeHit };
  };

  test("constellation 2 raises diluc's atk by 10% and atk spd by 5% when he takes damage", () => {
    expect.hasAssertions();
    const { kitEffectState, takeHit } = createConstellation2Fixture();
    takeHit();
    expect(getAttributeBonus(kitEffectState, Attribute.AttackPercent)).toBeCloseTo(0.1);
    expect(getAttributeBonus(kitEffectState, Attribute.NormalAttackSpeed)).toBeCloseTo(0.05);
  });

  test("constellation 2 stacks up to three times, raising diluc's atk by 30% and atk spd by 15%", () => {
    expect.hasAssertions();
    const { context, kitEffectState, takeHit } = createConstellation2Fixture();
    for (let hit = 0; hit < 4; hit++) {
      takeHit();
      stepKitEffects(1.5, context);
    }
    expect(getAttributeBonus(kitEffectState, Attribute.AttackPercent)).toBeCloseTo(0.3);
    expect(getAttributeBonus(kitEffectState, Attribute.NormalAttackSpeed)).toBeCloseTo(0.15);
  });

  test("constellation 2 takes its stack once every 1.5 seconds, so a hit inside the interval adds none", () => {
    expect.hasAssertions();
    const { context, kitEffectState, takeHit } = createConstellation2Fixture();
    takeHit();
    stepKitEffects(1, context);
    takeHit();
    expect(getAttributeBonus(kitEffectState, Attribute.AttackPercent)).toBeCloseTo(0.1);
  });

  test("constellation 2's stacks run out 10 seconds after the last one, and the next hit starts again from one", () => {
    expect.hasAssertions();
    const { context, kitEffectState, takeHit } = createConstellation2Fixture();
    takeHit();
    stepKitEffects(1.5, context);
    takeHit();
    stepKitEffects(10, context);
    takeHit();
    expect(getAttributeBonus(kitEffectState, Attribute.AttackPercent)).toBeCloseTo(0.1);
  });

  test("constellation 2 raises nothing for hp loss a kit of the team takes from its own effect", () => {
    expect.hasAssertions();
    const { kitEffectState, takeHit } = createConstellation2Fixture();
    takeHit(DILUC_CHARACTER_ID, OTHER_CHARACTER_ID);
    expect(getAttributeBonus(kitEffectState, Attribute.AttackPercent)).toBe(0);
  });

  test("constellation 2 raises nothing before its constellation", () => {
    expect.hasAssertions();
    const combatant = createCombatant(0);
    const { kitEffectState } = createKitTestContext(combatant);
    DILUC_KIT.onKitEvent?.(
      createHealthLossEvent(DILUC_CHARACTER_ID),
      createKitTestContext(combatant, { kitEffectState }),
      combatant,
    );
    expect(getAttributeBonus(kitEffectState, Attribute.AttackPercent)).toBe(0);
  });
});
