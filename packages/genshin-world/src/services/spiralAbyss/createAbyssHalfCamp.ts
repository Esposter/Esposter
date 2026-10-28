import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { GroundPoint } from "genshin-engine";

import { createDomainArenaCamp } from "#src/services/domains/createDomainArenaCamp";
import { checkIsEnemyKindId } from "#src/services/enemy/checkIsEnemyKindId";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The camp a half's monsters spawn as, standing evenly round the centre, each as the kind its describe is fought as and at
// The chamber's monster level. A describe the kinds do not hold is refused rather than spawned as nothing
export const createAbyssHalfCamp = (
  areaId: string,
  campId: string,
  center: GroundPoint,
  describeIds: readonly number[],
  enemyKindIds: Readonly<Record<string, number>>,
  monsterLevel: number,
): EnemyCamp => {
  const wave = describeIds.map((describeId) => {
    const enemyKindId = enemyKindIds[describeId];
    if (enemyKindId === undefined || !checkIsEnemyKindId(enemyKindId))
      throw new InvalidOperationError(Operation.Read, String(describeId), "has no enemy kind");
    return { count: 1, enemyKindId };
  });
  // Every describe names its kind, so the camp draws no stand-in and never reads the random source
  return createDomainArenaCamp(areaId, campId, center, wave, monsterLevel, () => 0);
};
