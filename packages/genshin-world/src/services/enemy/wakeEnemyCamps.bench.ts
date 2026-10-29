import type { Enemy } from "#src/models/enemy/Enemy";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { setEnemyState } from "#src/services/enemy/setEnemyState";
import { wakeEnemyCamps } from "#src/services/enemy/wakeEnemyCamps";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
// A tenth of the world's enemy population and the whole of it, which the world's loaded camps come to
const BENCH_ENEMY_COUNTS = [345, 3450];
// A camp of four members, every tenth camp engaged with its first member fighting and the rest alerted to it
const BENCH_CAMP_SIZE = 4;
const BENCH_ENGAGED_CAMP_INTERVAL = 10;
const createEnemyPopulation = (count: number): Enemy[] => {
  const enemies: Enemy[] = [];
  let campId = "";
  for (let index = 0; index < count; index += 1) {
    if (index % BENCH_CAMP_SIZE === 0) campId = crypto.randomUUID();
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, campId);
    const isEngagedCamp = Math.floor(index / BENCH_CAMP_SIZE) % BENCH_ENGAGED_CAMP_INTERVAL === 0;
    if (isEngagedCamp) setEnemyState(enemy, index % BENCH_CAMP_SIZE === 0 ? EnemyState.Chase : EnemyState.Alert);
    enemies.push(enemy);
  }
  return enemies;
};
// The population is settled, every idle enemy in a camp with none engaged, so a call changes nothing and only reads it:
// the cost a frame pays after the step that alerted its camps, and the population is safe to share across iterations
describe(wakeEnemyCamps, () => {
  test.for(BENCH_ENEMY_COUNTS)("%i enemies", async (count, { bench }) => {
    const enemies = createEnemyPopulation(count);
    await bench("wake", () => {
      wakeEnemyCamps(enemies);
    }).run(BENCHMARK_RUN_OPTIONS);
  });
});
