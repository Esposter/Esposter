import type { EnemyKind } from "#src/models/enemy/EnemyKind";

import { InvalidOperationError, Operation } from "@esposter/shared";

export const getEnemyKind = (enemyKindMap: ReadonlyMap<number, EnemyKind>, enemyKindId: number): EnemyKind => {
  const enemyKind = enemyKindMap.get(enemyKindId);
  if (!enemyKind)
    throw new InvalidOperationError(Operation.Read, String(enemyKindId), "has no row in the kinds' table");
  return enemyKind;
};
