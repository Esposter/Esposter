import type { Seelie } from "#src/models/puzzle/Seelie";
import type { GroundPoint } from "genshin-engine";

import { computeSeeliePosition } from "#src/services/puzzle/computeSeeliePosition";
import { SEELIE_FOLLOW_DISTANCE } from "#src/services/puzzle/constants";
import { computeGroundDistance } from "genshin-engine";

// Whether the character stands within reach of a Seelie on the ground, where it is followed and led along its route
export const checkIsSeelieFollowed = (seelie: Seelie, position: GroundPoint): boolean => {
  const seeliePosition = computeSeeliePosition(seelie);
  return computeGroundDistance(position, seeliePosition) <= SEELIE_FOLLOW_DISTANCE;
};
