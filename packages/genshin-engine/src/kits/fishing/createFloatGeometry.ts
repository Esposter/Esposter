import type { FloatGeometryOptions } from "#src/models/kits/fishing/FloatGeometryOptions";
import type { BufferGeometry } from "three";

import { createLatheStackGeometry } from "#src/kits/architecture/createLatheStackGeometry";

const FLOAT_RADIAL_SEGMENTS = 12;
// The float's bulb is its widest part, with a tapered foot and crown either side of it
const FLOAT_TAPER_RADIUS_SHARE = 0.4;

// A float as a lathed bulb, tapered at both ends, standing on the origin at its foot
export const createFloatGeometry = ({ height, radius }: FloatGeometryOptions): BufferGeometry => {
  const tipRadius = radius * FLOAT_TAPER_RADIUS_SHARE;
  return createLatheStackGeometry({
    isFaceted: false,
    radialSegments: FLOAT_RADIAL_SEGMENTS,
    sections: [
      { bottomRadius: tipRadius, height: height * 0.3, topRadius: radius },
      { bottomRadius: radius, height: height * 0.4, topRadius: radius },
      { bottomRadius: radius, height: height * 0.3, topRadius: tipRadius },
    ],
  });
};
