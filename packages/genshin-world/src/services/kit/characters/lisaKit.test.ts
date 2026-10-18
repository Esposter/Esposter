import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { LISA_CHARACTER_ID } from "#src/services/kit/characters/lisaKit";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { readKitStackedHit } from "#src/services/kit/readKitStackedHit";
import { stepKit } from "#src/services/kit/stepKit";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const LISA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, LISA_CHARACTER_ID);
const createLisaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: LISA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: LISA_KIT,
  level: 90,
});

// The status each of Lightning Rose's discharges gives an enemy it strikes, struck by Lisa at the ascension
const readDischargeEnemyStatuses = (ascension: number) => {
  const combatant: Combatant = { ...createLisaCombatant(), ascension };
  const context = createKitTestContext(combatant);
  LISA_KIT.elementalBurst.onStart?.(context);
  const summon = takeOne(
    context.kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon"),
  );
  return summon.hits.map((hit) => hit.enemyStatus?.(combatant));
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

  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const statuses = readDischargeEnemyStatuses(4);

    expect(statuses.length).toBeGreaterThan(1);
    expect(statuses).toStrictEqual(
      statuses.map(() => ({
        damageTakenBonus: 0,
        defenseReduction: 0.15,
        id: "lisa-lightning-rose",
        secondsRemaining: 10,
      })),
    );
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readDischargeEnemyStatuses(3).every((status) => status === undefined)).toBe(true);
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
});
