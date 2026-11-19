import type { BufferGeometry } from "three";

import {
  CRITTER_STAND_IN_HEIGHT,
  CRITTER_STAND_IN_RADIAL_SEGMENTS,
  CRITTER_STAND_IN_RADIUS,
} from "#src/kits/wildlife/constants";
import { createLatheStackGeometry } from "#src/kits/architecture/createLatheStackGeometry";

// A critter's stand-in as a low cone standing on its point, one shape for every critter group until a fit gives each
// Group its own outline
export const createCritterGeometry = (): BufferGeometry =>
  createLatheStackGeometry({
    isFaceted: false,
    radialSegments: CRITTER_STAND_IN_RADIAL_SEGMENTS,
    sections: [{ bottomRadius: CRITTER_STAND_IN_RADIUS, height: CRITTER_STAND_IN_HEIGHT, topRadius: 0 }],
  });
