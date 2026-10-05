import type { StoneLightUniforms } from "#src/nodes/StoneLightUniforms";

import { STONE_HARMONIC_COUNT, STONE_RAMP_KNOT_COUNT } from "#src/nodes/constants";
import { ClampToEdgeWrapping, Color, DataTexture, FloatType, LinearFilter, RGBAFormat, Vector3 } from "three";
import { uniform, uniformArray } from "three/tsl";

// One set per scene, shared by every stone material, dark until an hour's light is written into it. The ramp is a row
// Of its knots read with linear filtering, so between two knots it blends them as the solve that set them does
export const createStoneLightUniforms = (): StoneLightUniforms => {
  const ramp = new DataTexture(
    new Float32Array(STONE_RAMP_KNOT_COUNT * 4),
    STONE_RAMP_KNOT_COUNT,
    1,
    RGBAFormat,
    FloatType,
  );
  ramp.magFilter = LinearFilter;
  ramp.minFilter = LinearFilter;
  ramp.wrapS = ClampToEdgeWrapping;
  ramp.wrapT = ClampToEdgeWrapping;
  ramp.needsUpdate = true;
  return {
    harmonics: uniformArray(
      Array.from({ length: STONE_HARMONIC_COUNT }, () => new Vector3()),
      "vec3",
    ),
    ramp,
    sunRadiance: uniform(new Color()),
  };
};
