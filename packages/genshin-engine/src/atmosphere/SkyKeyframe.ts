import type { Color } from "three";

// How the sky and the light it casts look at one minute of the day. The sky blends between neighbouring keyframes,
// So a day is a handful of them in order: night, dawn, noon, dusk
export interface SkyKeyframe {
  cloudLitColor: Color;
  cloudShadeColor: Color;
  hemisphereGroundColor: Color;
  hemisphereIntensity: number;
  hemisphereSkyColor: Color;
  horizonColor: Color;
  // The sun's by day and the moon's by night, near zero where one hands over to the other at the horizon
  lightColor: Color;
  lightIntensity: number;
  minutes: number;
  starIntensity: number;
  zenithColor: Color;
}
