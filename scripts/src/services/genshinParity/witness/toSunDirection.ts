import type { Vector } from "#src/models/shared/Vector";

import { MathUtils } from "three";

// A direction toward the sun from its heading about up, from +x toward +z, and its height over the horizon, in degrees
export const toSunDirection = ([azimuth = 0, elevation = 0]: readonly number[]): Vector => {
  const [heading, height] = [MathUtils.degToRad(azimuth), MathUtils.degToRad(elevation)];
  return [Math.cos(height) * Math.cos(heading), Math.sin(height), Math.cos(height) * Math.sin(heading)];
};
