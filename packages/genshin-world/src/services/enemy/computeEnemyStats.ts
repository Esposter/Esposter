import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { EnemyStats } from "#src/models/enemy/EnemyStats";

import levelCurvesJson from "#src/data/enemies/levelCurves.json";
import { enemyLevelCurvesSchema } from "#src/models/enemy/EnemyLevelCurves";
import { InvalidOperationError, Operation } from "@esposter/shared";

const enemyLevelCurves = enemyLevelCurvesSchema.parse(levelCurvesJson);

const getLevelMultiplier = (curve: string, level: number): number => {
  const multiplier = enemyLevelCurves[curve]?.[level - 1];
  if (multiplier === undefined)
    throw new InvalidOperationError(Operation.Read, curve, `has no multiplier at level ${level}`);
  return multiplier;
};
// A kind's stats at a level: each base stat times its curve's multiplier at that level
export const computeEnemyStats = (
  { attackCurve, baseAttack, baseDefense, baseHealth, defenseCurve, healthCurve }: EnemyKind,
  level: number,
): EnemyStats => ({
  attack: baseAttack * getLevelMultiplier(attackCurve, level),
  defense: baseDefense * getLevelMultiplier(defenseCurve, level),
  maxHealth: baseHealth * getLevelMultiplier(healthCurve, level),
});
