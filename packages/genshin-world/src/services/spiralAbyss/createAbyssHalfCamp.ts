import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { GroundPoint } from "genshin-engine";

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
  members: describeIds.map((describeId, index) => {
    const enemyKindId = enemyKindIds[describeId];
    if (enemyKindId === undefined)
      throw new InvalidOperationError(Operation.Read, String(describeId), "has no enemy kind");
    const angle = (index / describeIds.length) * 2 * Math.PI;
    return {
      enemyKindId,
      id: String(index),
      level: monsterLevel,
      patrol: [],
      position: {
        x: center.x + Math.cos(angle) * ABYSS_ARENA_SPREAD,
        z: center.z + Math.sin(angle) * ABYSS_ARENA_SPREAD,
      },
    };
  }),
});
