import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { Outcrop } from "#src/models/leyLine/Outcrop";

import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { OUTCROP_CAMP_ID_PREFIX } from "#src/services/leyLine/constants";

// The camp a touch spawns at an outcrop: the camp its place holds, while the outcrop still waits to be touched. A fight
// Already under way, or a place no camp is placed at, spawns none
export const computeOutcropCamp = (
  enemyCamps: readonly EnemyCamp[],
  { placeId, stage }: Outcrop,
): EnemyCamp | undefined =>
  stage === OutcropStage.Waiting
    ? enemyCamps.find(({ id }) => id === `${OUTCROP_CAMP_ID_PREFIX}-${placeId}`)
    : undefined;
