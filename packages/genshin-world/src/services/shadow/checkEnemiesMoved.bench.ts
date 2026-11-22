import type { Enemy } from "#src/models/enemy/Enemy";

import { checkEnemiesMoved } from "#src/services/shadow/checkEnemiesMoved";
import { writeEnemyPoses } from "#src/services/shadow/writeEnemyPoses";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

type EnemyPose = Pick<Enemy, "heading" | "position">;

describe(checkEnemiesMoved, () => {
  // The loaded world's enemies at a tenth of their population and the whole of it, spread over rows of a hundred metres
  const BENCH_ENEMY_COUNTS = [345, 3450];
  const BENCH_ROW_LENGTH = 100;
  const createEnemyMap = (count: number): Map<string, EnemyPose> =>
    new Map(
      Array.from({ length: count }, (_value, index): [string, EnemyPose] => [
        `${index}`,
        { heading: 0, position: { x: index % BENCH_ROW_LENGTH, z: Math.floor(index / BENCH_ROW_LENGTH) } },
      ]),
    );

  test.for(BENCH_ENEMY_COUNTS)("%i enemies", async (count, { bench }) => {
    const enemyMap = createEnemyMap(count);
    const enemyPoses: number[] = [];
    writeEnemyPoses(enemyMap, enemyPoses);
    await bench("check", () => {
      checkEnemiesMoved(enemyMap, enemyPoses);
    }).run(BENCHMARK_RUN_OPTIONS);
  });
});
