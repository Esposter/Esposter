import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
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
    const tickCounts = [0.5, 0.5, 2.5].map((stepSeconds) => {
      const outbox: KitEvent[] = [];
      tickEnemyStatuses([enemy], stepSeconds, outbox);
      return outbox.length;
    });
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

    const outbox: KitEvent[] = [];
    tickEnemyStatuses([enemy], 1, outbox);

    expect(outbox).toStrictEqual([]);
  });

  test("a tick falls due on the step its seconds run out, not one step late", () => {
    expect.hasAssertions();
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    addEnemyStatus(enemy, {
      damageTakenBonus: 0,
      id: "",
      nextTickSeconds: 5,
      secondsRemaining: 100,
      tickIntervalSeconds: 100,
    });
    const outbox: KitEvent[] = [];
    for (let step = 0; step < 300; step++) tickEnemyStatuses([enemy], FIXED_STEP_SECONDS, outbox);

    expect(outbox).toHaveLength(1);
  });
});
