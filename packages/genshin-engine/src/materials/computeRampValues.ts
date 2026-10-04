import type { RampOptions } from "#src/materials/RampOptions";

import { MAX_BYTE } from "#src/constants";
import { MathUtils } from "three";

// The toon ramp as bytes, indexed by the light's angle remapped from -1 to 1 onto 0 to 1: dark up to the terminator,
// Lit past it, across a narrow smooth step. The dark side is zero, so a face turned from the sun takes only ambient
// Light, and its shade is the sky's colour rather than a darker copy of the lit colour
export const computeRampValues = ({ resolution, softness, terminator }: RampOptions): Uint8Array => {
  const lowerEdge = terminator - softness / 2;
  const upperEdge = terminator + softness / 2;
  return Uint8Array.from({ length: resolution }, (_value, index) => {
    const coordinate = (index + 0.5) / resolution;
    return Math.round(MathUtils.smoothstep(coordinate, lowerEdge, upperEdge) * MAX_BYTE);
  });
};
