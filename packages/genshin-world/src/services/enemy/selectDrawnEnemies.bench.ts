import type { Enemy } from "#src/models/enemy/Enemy";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { selectDrawnEnemies } from "#src/services/enemy/selectDrawnEnemies";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(selectDrawnEnemies, () => {
  // The draw's capacity, and the loaded world at a tenth of its enemy population and the whole of it
  const BENCH_CAPACITY = 64;
  const BENCH_ENEMY_COUNTS = [345, 3450];
  const BENCH_ROW_LENGTH = 100;
  const CHARACTER_POINT = { x: 0, z: 0 };
  // The population is spread over rows of a hundred metres, so the nearest enemies sit at the character's corner
  const createEnemyPopulation = (count: number): Enemy[] =>
    Array.from({ length: count }, (_value, index) =>
      createEnemy(
        enemyTables,
        [],
        {
          ...ENEMY_CAMP_MEMBER,
          id: `${index}`,
          position: { x: index % BENCH_ROW_LENGTH, z: Math.floor(index / BENCH_ROW_LENGTH) },
        },
        "",
      ),
    );

  test.for(BENCH_ENEMY_COUNTS)("%i enemies", async (count, { bench }) => {
    const enemies = createEnemyPopulation(count);
    await bench("draw", () => {
      selectDrawnEnemies(enemies, CHARACTER_POINT, BENCH_CAPACITY);
    }).run(BENCHMARK_RUN_OPTIONS);
  });
});
