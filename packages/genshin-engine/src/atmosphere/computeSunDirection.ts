import type { Vector3 } from "three";

import { MINUTES_PER_DAY } from "#src/clock/constants";

// The sun's direction at a minute of the day: rising due east (+x) at six, highest at noon, setting due west at
// Eighteen and lowest at midnight, on a circle tilted toward the south (+z) by the tilt in radians, so the noon sun
// Stands at ninety degrees less the tilt. Written into the vector it is given
export const computeSunDirection = (minutes: number, tilt: number, sunDirection: Vector3): Vector3 => {
  const hourAngle = (minutes / MINUTES_PER_DAY) * Math.PI * 2;
  const height = -Math.cos(hourAngle);
  return sunDirection.set(Math.sin(hourAngle), height * Math.cos(tilt), height * Math.sin(tilt));
};
