import type { BaseSkyState } from "#src/atmosphere/BaseSkyState";
import type { SkyShape } from "#src/atmosphere/SkyShape";
import type { Color, Vector3 } from "three";

// The sky at the clock's minute: its keyframes blended, and where the sun and moon stand. The light comes from
// Whichever of the two is above the horizon. A colour only a whole state sets, as a scene solved for one hour does,
// Is never blended, so a keyframe cannot set one
export interface SkyState extends BaseSkyState {
  // A cloud's lit colour away from the sun, where a sky tells it from the colour toward it
  cloudLitBackColor?: Color;
  // A cloud's shaded colour away from the sun, where a sky tells it from the colour toward it
  cloudShadeBackColor?: Color;
  // The haze's own colour where a scene sets one apart from its horizon's, as a sea of cloud lit under it does
  fogColor?: Color;
  // The haze's own density at its base where a scene sets one per hour, as a sea of cloud thickens through the day
  fogDensity?: number;
  // The horizon halo at its strength, where a sky has one
  haloColor?: Color;
  // The bottom colour away from the sun, where a sky tells it from the colour toward it
  horizonBackColor?: Color;
  lightDirection: Vector3;
  moonDirection: Vector3;
  // The glow round the moon at its strength, where a sky has one
  moonGlowColor?: Color;
  // The sky's own shape where a scene solves one per hour, the default's where not
  shape?: SkyShape;
  sunDirection: Vector3;
  // The sun's halo at its strength, where a sky has one
  sunHaloColor?: Color;
  // The top colour away from the sun, where a sky tells it from the colour toward it
  zenithBackColor?: Color;
}
