import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AuraType } from "#src/models/combat/AuraType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeElementalTicks } from "#src/services/kit/strikeElementalTicks";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(strikeElementalTicks, () => {
  const LEVEL = 90;
  const STURDY_HEALTH = 1e9;
  const ELECTRO_CHARGED_TICK: Reaction = {
    element: Element.Electro,
    reactionType: TransformativeReactionType.ElectroCharged,
  };
  const BURNING_TICK: Reaction = {
    element: Element.Pyro,
    reactionType: TransformativeReactionType.Burning,
    spreadGauge: 1,
  };
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: LEVEL,
  };
  const kind = getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId);
  const tickDamage = getTransformativeDamage(
    TransformativeReactionType.ElectroCharged,
    LEVEL,
    0,
    kind.elementResistances[Element.Electro],
  );

  const createSturdyEnemy = (x: number): Enemy => ({
    ...createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x, z: 0 } }, ""),
    health: STURDY_HEALTH,
    maxHealth: STURDY_HEALTH,
  });

  const createContext = (enemies: Enemy[]): KitContext =>
    createKitTestContext(combatant, {
      enemyMap: new Map(enemies.map((enemy, index) => [String(index), enemy])),
      enemyTables,
    });

  test("deals an Electro-Charged tick from the combatant that charged the enemy, arcing it to a Wet enemy beside it", () => {
    expect.hasAssertions();

    const charged = createSturdyEnemy(0);
    const wet = createSturdyEnemy(2);
    charged.electroChargedCombatant = combatant;
    charged.elementalReactions.push(ELECTRO_CHARGED_TICK);
    applyElement(wet.elementalState, Element.Hydro, 1);

    strikeElementalTicks(createContext([charged, wet]));

    expect(charged.maxHealth - charged.health).toBeCloseTo(tickDamage);
    expect(wet.maxHealth - wet.health).toBeCloseTo(tickDamage);
    expect(charged.elementalReactions).toStrictEqual([]);
  });

  test("a reaction a tick triggers is recorded for the world, with the enemy it landed on", () => {
    expect.hasAssertions();

    const burning = createSturdyEnemy(0);
    const wet = createSturdyEnemy(1);
    burning.burningCombatant = combatant;
    burning.elementalReactions.push(BURNING_TICK);
    applyElement(wet.elementalState, Element.Hydro, 1);
    const context = createContext([burning, wet]);

    strikeElementalTicks(context);

    expect(context.reactionTriggers.map(({ enemy }) => enemy)).toStrictEqual([wet]);
  });

  test("deals a Burning tick from the combatant that lit it, its Pyro reaching an enemy within a metre and no farther", () => {
    expect.hasAssertions();

    const burning = createSturdyEnemy(0);
    const near = createSturdyEnemy(1.4);
    const far = createSturdyEnemy(1.5);
    const burningDamage = getTransformativeDamage(
      TransformativeReactionType.Burning,
      LEVEL,
      0,
      kind.elementResistances[Element.Pyro],
    );
    burning.burningCombatant = combatant;
    burning.elementalReactions.push(BURNING_TICK);

    strikeElementalTicks(createContext([burning, near, far]));

    expect(burning.maxHealth - burning.health).toBeCloseTo(burningDamage);
    expect(near.maxHealth - near.health).toBeCloseTo(burningDamage);
    expect(near.elementalState.auras.has(AuraType.Pyro)).toBe(true);
    expect([far.health, far.elementalState.auras.size]).toStrictEqual([STURDY_HEALTH, 0]);
  });

  test.each<[string, Reaction]>([
    ["an Electro-Charged tick", ELECTRO_CHARGED_TICK],
    ["a Burning tick", BURNING_TICK],
  ])("deals nothing for %s no combatant owns, emptying the queue", (_description, tick) => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy(0);
    enemy.elementalReactions.push(tick);

    strikeElementalTicks(createContext([enemy]));

    expect([enemy.health, enemy.elementalReactions]).toStrictEqual([STURDY_HEALTH, []]);
  });
});
