import type { GroundPoint } from "genshin-engine";

import { REGION_REACH } from "#src/services/constants";
import { computeOutlineDistance } from "genshin-engine";

// Whether (x, z) is within reach of an outline, the distance a region's data and ground are loaded and released at
export const checkIsOutlineInReach = (outline: readonly GroundPoint[], x: number, z: number): boolean =>
  computeOutlineDistance(outline, x, z) <= REGION_REACH;
