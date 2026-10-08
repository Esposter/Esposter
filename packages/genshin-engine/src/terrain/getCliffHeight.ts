import type { CliffFeature } from "#src/models/terrain/CliffFeature";

import { measureSegment } from "#src/terrain/measureSegment";
import { MathUtils } from "three";

// A cliff's terrace: raised across the line up to its width, each edge blended across the falloff, and faded past the
// Segment's ends over the same falloff
export const getCliffHeight = (feature: CliffFeature, x: number, z: number): number => {
  const measurement = measureSegment(feature, x, z);
  const across = measurement[0] ?? 0;
  const beyond = measurement[1] ?? 0;
  const { falloff, height, width } = feature;
  return (
    height *
    MathUtils.smoothstep(across, -falloff, falloff) *
    (1 - MathUtils.smoothstep(across, width, width + falloff)) *
    (1 - MathUtils.smoothstep(beyond, 0, falloff))
  );
};
