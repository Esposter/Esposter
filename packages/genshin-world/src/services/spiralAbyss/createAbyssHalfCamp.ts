import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { GroundPoint } from "genshin-engine";

import { placeCampRing } from "#src/services/enemy/placeCampRing";
import { ABYSS_ARENA_SPREAD } from "#src/services/spiralAbyss/constants";
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
): EnemyCamp => ({
  areaId,
  id: campId,
  members: placeCampRing(
    center,
    ABYSS_ARENA_SPREAD,
    describeIds.map((describeId) => {
      const enemyKindId = enemyKindIds[describeId];
      if (enemyKindId === undefined)
        throw new InvalidOperationError(Operation.Read, String(describeId), "has no enemy kind");
      return { enemyKindId, level: monsterLevel };
    }),
  ),
});
