import type { Vector } from "#src/models/shared/Vector";

import {
  SKY_GRID_AZIMUTH_STEP_DEGREES,
  SKY_GRID_ELEVATION_MAXIMUM_DEGREES,
  SKY_GRID_ELEVATION_MINIMUM_DEGREES,
  SKY_GRID_ELEVATION_STEP_DEGREES,
} from "#src/services/genshinParity/witness/constants";
import { toSunDirection } from "#src/services/genshinParity/witness/toSunDirection";

// The sun directions laid over the sky for a solve to price before its simplex: every azimuth round the whole sky, each
// At every elevation from the minimum up to the maximum, a step apart, so a low dusk sun is among them
export const getSkyGridDirections = (): Vector[] => {
  const azimuthCount = 360 / SKY_GRID_AZIMUTH_STEP_DEGREES;
  const elevationSpan = SKY_GRID_ELEVATION_MAXIMUM_DEGREES - SKY_GRID_ELEVATION_MINIMUM_DEGREES;
  const elevationCount = Math.floor(elevationSpan / SKY_GRID_ELEVATION_STEP_DEGREES) + 1;
  const azimuths = Array.from({ length: azimuthCount }, (_value, index) => index * SKY_GRID_AZIMUTH_STEP_DEGREES);
  const elevations = Array.from(
    { length: elevationCount },
    (_value, index) => SKY_GRID_ELEVATION_MINIMUM_DEGREES + index * SKY_GRID_ELEVATION_STEP_DEGREES,
  );
  return azimuths.flatMap((azimuth) => elevations.map((elevation) => toSunDirection([azimuth, elevation])));
};
