import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { tickEnemyStatuses } from "#src/services/kit/tickEnemyStatuses";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(tickEnemyStatuses, () => {
  test("a status falls due once each interval while it lasts, and a refresh keeps its schedule", () => {
    expect.hasAssertions();
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const status = { damageTakenBonus: 0, id: "", nextTickSeconds: 1, secondsRemaining: 3, tickIntervalSeconds: 1 };
    addEnemyStatus(enemy, { ...status });
    const tickCounts = [0.5, 0.5, 2.5].map((stepSeconds) => tickEnemyStatuses([enemy], stepSeconds).length);
    addEnemyStatus(enemy, { ...status });

    expect(tickCounts).toStrictEqual([0, 1, 2]);
    expect(enemy.statuses[0]?.nextTickSeconds).toBe(0.5);
  });

  test("a status that has run out falls due no more", () => {
    expect.hasAssertions();
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    addEnemyStatus(enemy, {
      damageTakenBonus: 0,
      id: "",
      nextTickSeconds: 1,
      secondsRemaining: 0,
      tickIntervalSeconds: 1,
    });

    expect(tickEnemyStatuses([enemy], 1)).toStrictEqual([]);
  });
});
