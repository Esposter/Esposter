import type { Color } from "three";

// The part of the sky a keyframe sets and the clock blends between neighbouring keyframes: the sky's top, bottom and
// Cloud colours, the ambient hemisphere's, the light's and the stars'
export interface BaseSkyState {
  cloudLitColor: Color;
  cloudShadeColor: Color;
  hemisphereGroundColor: Color;
  hemisphereIntensity: number;
  hemisphereSkyColor: Color;
  horizonColor: Color;
  // The sun's by day and the moon's by night, near zero where one hands over to the other at the horizon
  lightColor: Color;
  lightIntensity: number;
  starIntensity: number;
  zenithColor: Color;
}
