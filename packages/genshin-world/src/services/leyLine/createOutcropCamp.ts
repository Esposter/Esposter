import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";

import { computeOutcropCampId } from "#src/services/leyLine/computeOutcropCampId";
import {
  OUTCROP_CAMP_ENEMY_KIND_IDS,
  OUTCROP_CAMP_LEVEL,
  OUTCROP_CAMP_SIZE,
  OUTCROP_FIGHT_RADIUS,
} from "#src/services/leyLine/constants";
import { takeOne } from "@esposter/shared";

// The camp a fight spawns at an outcrop's place, provisional: OUTCROP_CAMP_SIZE members, each drawn from the kinds the
// World places, standing evenly round the place at half its fight radius so each stands within the fight. The camp is
// Named by its place and placed in the region `areaId` names
export const createOutcropCamp = (
  areaId: string,
  { id, position }: OutcropPlacement,
  random: () => number,
): EnemyCamp => ({
  areaId,
  id: computeOutcropCampId(id),
  members: Array.from({ length: OUTCROP_CAMP_SIZE }, (_, index) => {
    const angle = (index / OUTCROP_CAMP_SIZE) * 2 * Math.PI;
    const spreadRadius = OUTCROP_FIGHT_RADIUS / 2;
    return {
      enemyKindId: takeOne(OUTCROP_CAMP_ENEMY_KIND_IDS, Math.floor(random() * OUTCROP_CAMP_ENEMY_KIND_IDS.length)),
      id: String(index),
      level: OUTCROP_CAMP_LEVEL,
      patrol: [],
      position: { x: position.x + Math.cos(angle) * spreadRadius, z: position.z + Math.sin(angle) * spreadRadius },
    };
  }),
});
