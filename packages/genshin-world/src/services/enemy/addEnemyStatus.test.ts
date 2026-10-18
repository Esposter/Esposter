import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { stepEnemy } from "#src/services/enemy/stepEnemy";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createStatus = (): EnemyStatus => ({ damageTakenBonus: 0, id: "status", secondsRemaining: 2 });

describe(addEnemyStatus, () => {
  test("gives each enemy its own copy, so stepping one enemy's status leaves another's as it was", () => {
    expect.hasAssertions();

    const status = createStatus();
    const stepped = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const untouched = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    addEnemyStatus(stepped, status);
    addEnemyStatus(untouched, status);
    stepEnemy(stepped, undefined, 1);

    expect(stepped.statuses).toStrictEqual([{ ...createStatus(), secondsRemaining: 1 }]);
    expect(untouched.statuses).toStrictEqual([createStatus()]);
  });

  test("restarts a status re-added after its copy was stepped down to its full seconds", () => {
    expect.hasAssertions();

    const status = createStatus();
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    addEnemyStatus(enemy, status);
    stepEnemy(enemy, undefined, 1);
    addEnemyStatus(enemy, status);

    expect(enemy.statuses).toStrictEqual([createStatus()]);
  });
});
