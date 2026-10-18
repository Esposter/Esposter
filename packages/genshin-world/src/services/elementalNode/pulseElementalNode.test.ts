import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ELEMENTAL_NODE_MAX_GAUGE, ELEMENTAL_NODE_PULSE_GAUGE } from "#src/services/elementalNode/constants";
import { pulseElementalNode } from "#src/services/elementalNode/pulseElementalNode";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createTestEnemy = () => createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

describe(pulseElementalNode, () => {
  test("an unbuffed enemy gains the node's full gauge, which does not decay", () => {
    expect.hasAssertions();

    const enemy = createTestEnemy();

    pulseElementalNode(enemy, Element.Pyro);

    expect(enemy.elementalState.auras.get(AuraType.Pyro)).toStrictEqual({
      decayRate: 0,
      gauge: ELEMENTAL_NODE_PULSE_GAUGE,
      isImmutable: false,
    });
    expect(enemy.statuses).toHaveLength(1);
    expect(enemy.statuses[0]?.secondsRemaining).toBe(Infinity);
  });

  test("a buffed enemy gains a further 1.2 gauge, up to the buff's most", () => {
    expect.hasAssertions();

    const enemy = createTestEnemy();

    pulseElementalNode(enemy, Element.Pyro);
    applyElement(enemy.elementalState, Element.Cryo, 1);
    const gaugeBefore = enemy.elementalState.auras.get(AuraType.Pyro)?.gauge ?? 0;
    expect(gaugeBefore).toBeLessThan(ELEMENTAL_NODE_MAX_GAUGE);

    pulseElementalNode(enemy, Element.Pyro);

    expect(enemy.elementalState.auras.get(AuraType.Pyro)?.gauge).toBeCloseTo(
      Math.min(ELEMENTAL_NODE_MAX_GAUGE, gaugeBefore + 1.2),
    );
  });

  test("a buffed enemy resists more to its node's element, and to every other, while the buff lasts", () => {
    expect.hasAssertions();

    const enemy = createTestEnemy();
    const unbuffedEnemy = createTestEnemy();
    const enemyKind = getEnemyKind(enemyTables.enemyKindMap, enemy.enemyKindId);

    pulseElementalNode(enemy, Element.Pyro);

    expect(getEnemyResistance(enemyKind, enemy, Element.Pyro)).toBeCloseTo(
      getEnemyResistance(enemyKind, unbuffedEnemy, Element.Pyro) + 1,
    );
    expect(getEnemyResistance(enemyKind, enemy, Element.Hydro)).toBeCloseTo(
      getEnemyResistance(enemyKind, unbuffedEnemy, Element.Hydro) + 0.5,
    );
    expect(getEnemyResistance(enemyKind, enemy, undefined)).toBeCloseTo(
      getEnemyResistance(enemyKind, unbuffedEnemy, undefined) + 0.5,
    );
  });

  test("a pulse on an enemy cooling down from a depleted buff spends the pulse and lays nothing", () => {
    expect.hasAssertions();

    const enemy = createTestEnemy();
    enemy.elementalNodePulsesLeft = 2;

    pulseElementalNode(enemy, Element.Pyro);

    expect(enemy.elementalNodePulsesLeft).toBe(1);
    expect(enemy.elementalState.auras.get(AuraType.Pyro)).toBeUndefined();
    expect(enemy.statuses).toStrictEqual([]);
  });
});
