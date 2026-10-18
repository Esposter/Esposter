import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";

// The one enemy a hit with a target index strikes: among the living enemies its area reaches from the body, the one at
// Its index, wrapped to their count as gcsim's shells take their enemies in turn. None when its area reaches no living one
export const selectKitHitTarget = (hit: KitHit, body: KitBody, enemies: Iterable<Enemy>): Enemy | undefined => {
  if (hit.targetIndex === undefined) return undefined;
  const reachedEnemies = [...enemies].filter(
    (enemy) =>
      ![EnemyState.Dead, EnemyState.Return].includes(enemy.state) && checkIsInAttackArea(hit.hitArea, body, enemy),
  );
  if (reachedEnemies.length === 0) return undefined;
  return reachedEnemies[hit.targetIndex % reachedEnemies.length];
};
