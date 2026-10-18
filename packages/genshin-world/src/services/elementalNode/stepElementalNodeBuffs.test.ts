import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { checkIsElementalNodeBuffed } from "#src/services/elementalNode/checkIsElementalNodeBuffed";
import { ELEMENTAL_NODE_COOLDOWN_PULSES, ELEMENTAL_NODE_PULSE_GAUGE } from "#src/services/elementalNode/constants";
import { pulseElementalNode } from "#src/services/elementalNode/pulseElementalNode";
import { stepElementalNodeBuffs } from "#src/services/elementalNode/stepElementalNodeBuffs";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createTestEnemy = () => createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

describe(stepElementalNodeBuffs, () => {
  test("a buff a reaction depletes is lifted at the next step, and its enemy waits two pulses to regain it", () => {
    expect.hasAssertions();

    const enemy = createTestEnemy();

    pulseElementalNode(enemy, Element.Pyro);
    // Melt spends half its Cryo gauge of the Pyro aura, so twice the buff's gauge spends all of the buff
    applyElement(enemy.elementalState, Element.Cryo, 2 * ELEMENTAL_NODE_PULSE_GAUGE);
    expect(checkIsElementalNodeBuffed(enemy, Element.Pyro)).toBe(false);
    expect(enemy.statuses).toHaveLength(1);

    stepElementalNodeBuffs(enemy);

    expect(enemy.statuses).toStrictEqual([]);
    expect(enemy.elementalNodePulsesLeft).toBe(ELEMENTAL_NODE_COOLDOWN_PULSES);

    pulseElementalNode(enemy, Element.Pyro);
    pulseElementalNode(enemy, Element.Pyro);
    expect(enemy.elementalState.auras.get(AuraType.Pyro)?.gauge ?? 0).toBe(0);

    pulseElementalNode(enemy, Element.Pyro);
    expect(checkIsElementalNodeBuffed(enemy, Element.Pyro)).toBe(true);
  });

  test("a buff still held is kept through a step", () => {
    expect.hasAssertions();

    const enemy = createTestEnemy();

    pulseElementalNode(enemy, Element.Pyro);
    stepElementalNodeBuffs(enemy);

    expect(enemy.statuses).toHaveLength(1);
    expect(enemy.elementalNodePulsesLeft).toBe(0);
  });
});
