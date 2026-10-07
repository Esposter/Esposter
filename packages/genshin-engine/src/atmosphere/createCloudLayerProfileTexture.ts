import type { CloudLayerDome } from "#src/models/atmosphere/CloudLayerDome";

import { ClampToEdgeWrapping, DataTexture, DataUtils, HalfFloatType, LinearFilter, MathUtils, RGBAFormat } from "three";

// How many samples the profiles are resampled into, evenly from the horizon to the zenith: the dome's rings bunch
// Toward its top, and a degree and a half a sample keeps each ring's knot
const PROFILE_SAMPLE_COUNT = 64;
const RIGHT_ANGLE = 90;
// One profile read at an elevation, linearly between the knots either side and held past the last
const readProfile = (elevations: readonly number[], values: readonly number[], elevation: number): number => {
  const upper = elevations.findIndex((knot) => knot >= elevation);
  if (upper <= 0) return values[upper === 0 ? 0 : values.length - 1] ?? 0;
  const [lowElevation = 0, highElevation = 0] = [elevations[upper - 1], elevations[upper]];
  const [low = 0, high = 0] = [values[upper - 1], values[upper]];
  return MathUtils.lerp(low, high, (elevation - lowElevation) / Math.max(highElevation - lowElevation, Number.EPSILON));
};
// A cloud layer's dome as the texture its node reads by elevation, the horizon at the left and the zenith at the
// Right: the wisps' strip's height, the near and far projections' radii and the normal's tilt as a share of a right
// Angle, each resampled evenly from the dome's rings, in half floats, which every device filters
export const createCloudLayerProfileTexture = ({
  elevations,
  far,
  near,
  normalElevations,
  wisps,
}: Pick<CloudLayerDome, "elevations" | "far" | "near" | "normalElevations" | "wisps">): DataTexture => {
  const data = new Uint16Array(PROFILE_SAMPLE_COUNT * 4);
  for (let index = 0; index < PROFILE_SAMPLE_COUNT; index++) {
    const elevation = (index / (PROFILE_SAMPLE_COUNT - 1)) * RIGHT_ANGLE;
    data.set(
      [
        readProfile(elevations, wisps, elevation),
        readProfile(elevations, near, elevation),
        readProfile(elevations, far, elevation),
        readProfile(elevations, normalElevations, elevation) / RIGHT_ANGLE,
      ].map((value) => DataUtils.toHalfFloat(value)),
      index * 4,
    );
  }
  const texture = new DataTexture(data, PROFILE_SAMPLE_COUNT, 1, RGBAFormat, HalfFloatType);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
};
