import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";

import { createEnemy } from "#src/services/enemy/createEnemy";

// A stage's enemies as the world spawns them: each monster the stage names, created from its kind at the stage's level.
// Each is placed in a row in front of the performers, so no enemy stands on another.
export const spawnImaginariumStageEnemies = (
  monsterIds: readonly number[],
  level: number,
  enemyTables: EnemyTables,
): Enemy[] =>
  monsterIds.map((enemyKindId, index) =>
    createEnemy(
      enemyTables,
      [],
      { enemyKindId, id: String(index), level, patrol: [], position: { x: index, z: -1 } },
      "",
    ),
  );
