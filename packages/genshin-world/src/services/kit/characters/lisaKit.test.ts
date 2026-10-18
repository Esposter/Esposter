import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { LISA_CHARACTER_ID } from "#src/services/kit/characters/lisaKit";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { readKitStackedHit } from "#src/services/kit/readKitStackedHit";
import { stepKit } from "#src/services/kit/stepKit";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const LISA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, LISA_CHARACTER_ID);
const createLisaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.EnergyRecharge, value: 1 },
  ]),
  characterId: LISA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: LISA_KIT,
  level: 90,
});
const OTHER_CHARACTER_ID = 10_000_999;

const createLisaEnemy = (x: number, z: number): Enemy => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  position: { x, z },
});
const countConductiveStacks = (enemy: Enemy): number =>
  enemy.statuses.find(({ id }) => id === "conductive")?.stacks ?? 0;
// A character taking the field over another, as the party's swap reports it to Lisa's kit
const swapCharacter = (combatant: Combatant, context: KitContext, characterId: number, previousCharacterId: number) =>
  LISA_KIT.onKitEvent?.({ characterId, kind: KitEventKind.CharacterSwapped, previousCharacterId }, context, combatant);

// Each enemy one of Violet Arc's hold hits strikes, as the hit's strike reports it to the kit
const strikeHoldEnemies = (combatant: Combatant, context: KitContext, count: number) => {
  const hold = takeOne(LISA_KIT.elementalSkillHolds ?? []).action;
  const hit = takeOne(hold.hits);
  for (let enemy = 0; enemy < count; enemy++) hit.onStrike?.(context, { body: context.body, combatant, hit });
  return hold;
};

describe("lisa kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...LISA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(LISA_KIT.chargedAttack.hits).talentMultiplier,
      LISA_KIT.plungeCollision.talentMultiplier,
      takeOne(LISA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(LISA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(LISA_KIT.elementalSkill.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.396, 0.3592, 0.428, 0.5496, 1.7712, 0.5683, 1.1363, 1.4193, 0.8];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("its Lightning Rose discharges thirty times for 15 seconds from its first, then ends", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(createLisaCombatant(), { kitEffectState });
    LISA_KIT.elementalBurst.onStart?.(context);

    const discharges = stepKitTestEffects(17, context);
    expect(discharges).toHaveLength(30);
    expect(discharges.every(({ hit }) => hit.talentMultiplier === 0.3656)).toBe(true);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("stacks Conductive on each enemy its press strikes, up to three", () => {
    expect.hasAssertions();
    const enemy = { ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), health: 1e9, maxHealth: 1e9 };
    const press = takeOne(LISA_KIT.elementalSkill.hits);

    for (let strike = 0; strike < 4; strike++) strikeEnemy(enemyTables, enemy, press, createLisaCombatant(), () => 1);

    expect(enemy.statuses.map(({ id, stacks }) => [id, stacks])).toStrictEqual([["conductive", 3]]);
  });

  test("its hold strikes an enemy at the multiplier of its Conductive stacks, and consumes them", () => {
    expect.hasAssertions();
    const hold = LISA_KIT.elementalSkillHolds?.[0]?.action;
    const hit = takeOne(hold?.hits ?? []) satisfies KitHit;
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    enemy.statuses = [{ damageTakenBonus: 0, id: "conductive", secondsRemaining: Infinity, stacks: 2 }];

    const read = readKitStackedHit(enemy, hit);

    expect(read.talentMultiplier).toBeCloseTo(4.24, 2);
    expect(read.poiseDamage).toBe(240);
    expect(enemy.statuses).toStrictEqual([]);
  });

  test("its hold is released by itself at 4 seconds held, and holding on past them starts it no second time", () => {
    expect.hasAssertions();
    const kitState = createKitState();
    const partyMember = createPartyMember();
    const stamina = createStamina(STAMINA_MAX);
    const landedHits: KitHit[] = [];
    const context = createKitTestContext(createLisaCombatant());
    const idleInput: KitInput = {
      height: 0,
      isAttackHeld: false,
      isAttackPressed: false,
      isBurstPressed: false,
      isSkillHeld: false,
      isSkillPressed: false,
      locomotionState: LocomotionState.Idle,
    };
    // A quarter second a step keeps the held seconds exact, so the skill reaches its 4 seconds after 16 steps, and is held
    // Past them until the step 28 lets it go
    const startedSteps: number[] = [];
    for (let step = 0; step < 40; step++) {
      const action = stepKit(
        kitState,
        LISA_KIT,
        { ...idleInput, isSkillHeld: step < 28 },
        partyMember,
        stamina,
        0.25,
        landedHits,
        context,
      );
      if (action) startedSteps.push(step);
    }

    expect(startedSteps).toStrictEqual([15]);
  });

  test("constellation 6 gives each opponent within 5 metres of her three stacks of Conductive when she takes the field", () => {
    expect.hasAssertions();
    const combatant: Combatant = { ...createLisaCombatant(), constellationCount: 6 };
    const near = createLisaEnemy(4, 0);
    const far = createLisaEnemy(0, 6);
    const context = createKitTestContext(combatant, {
      enemyMap: new Map([
        ["near", near],
        ["far", far],
      ]),
    });

    swapCharacter(combatant, context, LISA_CHARACTER_ID, OTHER_CHARACTER_ID);

    expect([countConductiveStacks(near), countConductiveStacks(far)]).toStrictEqual([3, 0]);
  });

  test("constellation 6 gives its stacks once every 5 seconds, so a swap within them gives none", () => {
    expect.hasAssertions();
    const combatant: Combatant = { ...createLisaCombatant(), constellationCount: 6 };
    const enemy = createLisaEnemy(1, 0);
    const context = createKitTestContext(combatant, { enemyMap: new Map([["enemy", enemy]]) });
    const stackCounts: number[] = [];

    swapCharacter(combatant, context, LISA_CHARACTER_ID, OTHER_CHARACTER_ID);
    stackCounts.push(countConductiveStacks(enemy));
    enemy.statuses = [];
    swapCharacter(combatant, context, LISA_CHARACTER_ID, OTHER_CHARACTER_ID);
    stackCounts.push(countConductiveStacks(enemy));
    stepKitSeconds(context, 6);
    swapCharacter(combatant, context, LISA_CHARACTER_ID, OTHER_CHARACTER_ID);
    stackCounts.push(countConductiveStacks(enemy));

    expect(stackCounts).toStrictEqual([3, 0, 3]);
  });

  test("constellation 6 gives no stacks when another character takes the field, or below Constellation 6", () => {
    expect.hasAssertions();
    const combatantAtConstellation6: Combatant = { ...createLisaCombatant(), constellationCount: 6 };
    const combatantAtConstellation5: Combatant = { ...createLisaCombatant(), constellationCount: 5 };
    const enemyAtConstellation6 = createLisaEnemy(1, 0);
    const enemyAtConstellation5 = createLisaEnemy(1, 0);
    const contextAtConstellation6 = createKitTestContext(combatantAtConstellation6, {
      enemyMap: new Map([["enemy", enemyAtConstellation6]]),
    });
    const contextAtConstellation5 = createKitTestContext(combatantAtConstellation5, {
      enemyMap: new Map([["enemy", enemyAtConstellation5]]),
    });

    swapCharacter(combatantAtConstellation6, contextAtConstellation6, OTHER_CHARACTER_ID, LISA_CHARACTER_ID);
    swapCharacter(combatantAtConstellation5, contextAtConstellation5, LISA_CHARACTER_ID, OTHER_CHARACTER_ID);

    expect([countConductiveStacks(enemyAtConstellation6), countConductiveStacks(enemyAtConstellation5)]).toStrictEqual([
      0, 0,
    ]);
  });

  test("constellation 1 regenerates 2 Energy for each opponent Violet Arc's hold hits", () => {
    expect.hasAssertions();
    const party = createParty([LISA_CHARACTER_ID]);
    const combatant: Combatant = { ...createLisaCombatant(), constellationCount: 1 };
    const context = createKitTestContext(combatant, { party });
    takeOne(LISA_KIT.elementalSkillHolds ?? []).action.onStart?.(context);

    strikeHoldEnemies(combatant, context, 3);

    expect(getPartyMember(party, LISA_CHARACTER_ID).energy).toBe(6);
  });

  test("constellation 1 holds the Energy a hold regenerates to 10, so the hits past five give none", () => {
    expect.hasAssertions();
    const party = createParty([LISA_CHARACTER_ID]);
    const combatant: Combatant = { ...createLisaCombatant(), constellationCount: 1 };
    const context = createKitTestContext(combatant, { party });
    takeOne(LISA_KIT.elementalSkillHolds ?? []).action.onStart?.(context);

    strikeHoldEnemies(combatant, context, 7);

    expect(getPartyMember(party, LISA_CHARACTER_ID).energy).toBe(10);
  });

  test("constellation 1 regenerates again on the next hold, which starts its own count", () => {
    expect.hasAssertions();
    const party = createParty([LISA_CHARACTER_ID]);
    const combatant: Combatant = { ...createLisaCombatant(), constellationCount: 1 };
    const context = createKitTestContext(combatant, { party });
    takeOne(LISA_KIT.elementalSkillHolds ?? []).action.onStart?.(context);
    strikeHoldEnemies(combatant, context, 5);
    takeOne(LISA_KIT.elementalSkillHolds ?? []).action.onStart?.(context);

    strikeHoldEnemies(combatant, context, 5);

    expect(getPartyMember(party, LISA_CHARACTER_ID).energy).toBe(20);
  });

  test("constellation 1 regenerates no Energy below Constellation 1", () => {
    expect.hasAssertions();
    const party = createParty([LISA_CHARACTER_ID]);
    const combatant: Combatant = { ...createLisaCombatant(), constellationCount: 0 };
    const context = createKitTestContext(combatant, { party });
    takeOne(LISA_KIT.elementalSkillHolds ?? []).action.onStart?.(context);

    strikeHoldEnemies(combatant, context, 3);

    expect(getPartyMember(party, LISA_CHARACTER_ID).energy).toBe(0);
  });
});
