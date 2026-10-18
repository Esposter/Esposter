import type { Moondrift } from "#src/models/party/Moondrift";
import type { GroundPoint } from "genshin-engine";

import { MOONDRIFT_NEARBY_RADIUS } from "#src/services/party/constants";

// Whether a Moondrift stands near a point on the ground, within the radius a Moondrift is near a character at
export const checkIsNearMoondrift = (moondrift: Moondrift, point: GroundPoint): boolean =>
  Math.hypot(moondrift.position.x - point.x, moondrift.position.z - point.z) < MOONDRIFT_NEARBY_RADIUS;
