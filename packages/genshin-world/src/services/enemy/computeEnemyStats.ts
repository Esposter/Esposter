import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { EnemyLevelCurves } from "#src/models/enemy/EnemyLevelCurves";
import type { EnemyStats } from "#src/models/enemy/EnemyStats";

import { InvalidOperationError, Operation } from "@esposter/shared";

const getLevelMultiplier = (enemyLevelCurves: EnemyLevelCurves, curve: string, level: number): number => {
  const multiplier = enemyLevelCurves[curve]?.[level - 1];
  if (multiplier === undefined)
    throw new InvalidOperationError(Operation.Read, curve, `has no multiplier at level ${level}`);
  return multiplier;
};
// A kind's stats at a level: each base stat times its curve's multiplier at that level
export const computeEnemyStats = (
  enemyLevelCurves: EnemyLevelCurves,
  { attackCurve, baseAttack, baseDefense, baseHealth, defenseCurve, healthCurve }: EnemyKind,
  level: number,
): EnemyStats => ({
  attack: baseAttack * getLevelMultiplier(enemyLevelCurves, attackCurve, level),
  defense: baseDefense * getLevelMultiplier(enemyLevelCurves, defenseCurve, level),
  maxHealth: baseHealth * getLevelMultiplier(enemyLevelCurves, healthCurve, level),
});
