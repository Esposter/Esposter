import type { RampOptions } from "#src/models/materials/RampOptions";

import { MAX_BYTE } from "#src/constants";
import { MathUtils } from "three";

// The toon ramp as bytes, indexed by the light's angle remapped from -1 to 1 onto 0 to 1: shade up to the terminator,
// Lit past it, across a narrow smooth step. A ramp with no shade is zero on the dark side, so a face turned from the sun
// takes only ambient light, and its shade is the sky's colour rather than a darker copy of the lit colour
export const computeRampValues = ({ resolution, shade, softness, terminator }: RampOptions): Uint8Array => {
  const lowerEdge = terminator - softness / 2;
  const upperEdge = terminator + softness / 2;
  return Uint8Array.from({ length: resolution }, (_value, index) => {
    const coordinate = (index + 0.5) / resolution;
    const lit = MathUtils.smoothstep(coordinate, lowerEdge, upperEdge);
    return Math.round(MathUtils.lerp(shade, 1, lit) * MAX_BYTE);
  });
};
