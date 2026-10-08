import type { Enemy } from "#src/models/enemy/Enemy";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { KitBody } from "#src/models/kit/KitBody";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { computeFacingAngle } from "#src/services/kit/computeFacingAngle";
import {
  ALTITUDE_COEFFICIENT,
  ALTITUDE_LIMIT,
  TARGET_ANGLE_WEIGHT,
  TARGET_DISTANCE_WEIGHT,
} from "#src/services/kit/constants";

// The enemy an action turns the body to as it starts: the living one scoring highest within its targeting area. The
// Score is 0.7 × (1 − distance ÷ radius) + 0.3 × (1 − angle ÷ 180°), a fifth of it for an enemy more than 2 metres above
// Or below the body. None is picked when no living enemy is within the area
export const selectAttackTarget = (
  targetingArea: AttackArea,
  body: KitBody,
  enemies: Iterable<Enemy>,
): Enemy | undefined => {
  const altitudeMultiplier = Math.abs(body.height) > ALTITUDE_LIMIT ? ALTITUDE_COEFFICIENT : 1;
  let selectedEnemy: Enemy | undefined;
  let selectedScore = -Infinity;
  for (const enemy of enemies) {
    if (enemy.state === EnemyState.Dead || !checkIsInAttackArea(targetingArea, body, enemy)) continue;
    const distance = Math.hypot(enemy.position.x - body.position.x, enemy.position.z - body.position.z);
    const angle = computeFacingAngle(body.position, body.facing, enemy.position);
    const score =
      (TARGET_DISTANCE_WEIGHT * (1 - distance / targetingArea.radius) + TARGET_ANGLE_WEIGHT * (1 - angle / Math.PI)) *
      altitudeMultiplier;
    if (score > selectedScore) {
      selectedEnemy = enemy;
      selectedScore = score;
    }
  }
  return selectedEnemy;
};
