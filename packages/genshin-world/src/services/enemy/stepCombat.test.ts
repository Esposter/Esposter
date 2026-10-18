import type { CombatState } from "#src/models/combat/CombatState";
import type { Enemy } from "#src/models/enemy/Enemy";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CombatEvent } from "#src/models/combat/CombatEvent";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { COMBAT_CLEAR_SECONDS, ENEMY_STEP_SECONDS } from "#src/services/enemy/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { setEnemyState } from "#src/services/enemy/setEnemyState";
import { stepCombat } from "#src/services/enemy/stepCombat";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createEnemyIn = (state: EnemyState): Enemy => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  setEnemyState(enemy, state);
  return enemy;
};

const createCombat = (isInCombat: boolean): CombatState => ({ clearSeconds: 0, isInCombat });

describe(stepCombat, () => {
  test("the party enters combat once an enemy is aggravated on it", () => {
    expect.hasAssertions();

    const combat = createCombat(false);
    const combatEvent = stepCombat(combat, [createEnemyIn(EnemyState.Chase)], ENEMY_STEP_SECONDS);

    expect(combatEvent).toBe(CombatEvent.Enter);
    expect(combat.isInCombat).toBe(true);
  });

  test("idle and returning enemies leave the party out of combat", () => {
    expect.hasAssertions();

    const combat = createCombat(false);
    const combatEvent = stepCombat(
      combat,
      [createEnemyIn(EnemyState.Idle), createEnemyIn(EnemyState.Return)],
      ENEMY_STEP_SECONDS,
    );

    expect(combatEvent).toBeUndefined();
    expect(combat.isInCombat).toBe(false);
  });

  test("the party leaves combat once no enemy has been aggravated for the grace period", () => {
    expect.hasAssertions();

    const combat = createCombat(true);
    const idle = [createEnemyIn(EnemyState.Idle)];

    expect(stepCombat(combat, idle, COMBAT_CLEAR_SECONDS - ENEMY_STEP_SECONDS)).toBeUndefined();
    expect(stepCombat(combat, idle, 2 * ENEMY_STEP_SECONDS)).toBe(CombatEvent.Leave);
    expect(combat.isInCombat).toBe(false);
  });

  test("an enemy aggravated again within the grace period restarts the clock", () => {
    expect.hasAssertions();

    const combat = createCombat(true);
    stepCombat(combat, [createEnemyIn(EnemyState.Idle)], COMBAT_CLEAR_SECONDS - ENEMY_STEP_SECONDS);

    expect(stepCombat(combat, [createEnemyIn(EnemyState.Chase)], ENEMY_STEP_SECONDS)).toBeUndefined();
    expect(
      stepCombat(combat, [createEnemyIn(EnemyState.Idle)], COMBAT_CLEAR_SECONDS - ENEMY_STEP_SECONDS),
    ).toBeUndefined();
    expect(combat.isInCombat).toBe(true);
  });
});
