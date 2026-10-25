import { MathUtils } from "three";

// The mean of angles in degrees, read round the circle so a spread across ±180 does not cancel
export const computeMeanAngle = (angles: readonly number[]): number =>
  MathUtils.radToDeg(
    Math.atan2(
      angles.reduce((sum, angle) => sum + Math.sin(MathUtils.degToRad(angle)), 0),
      angles.reduce((sum, angle) => sum + Math.cos(MathUtils.degToRad(angle)), 0),
    ),
  );
