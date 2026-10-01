import type { SkyKeyframe } from "#src/atmosphere/SkyKeyframe";
import type { SkyShape } from "#src/atmosphere/SkyShape";
import type { Color, Vector3 } from "three";

// The sky at the clock's minute: its keyframes blended, and where the sun and moon stand. The light comes from
// Whichever of the two is above the horizon
export interface SkyState extends Omit<SkyKeyframe, "minutes"> {
  // The haze's own colour where a scene sets one apart from its horizon's, as a sea of cloud lit under it does
  fogColor?: Color;
  // The haze's own density at its base where a scene sets one per hour, as a sea of cloud thickens through the day
  fogDensity?: number;
  lightDirection: Vector3;
  // The sky's own shape where a scene solves one per hour, the default's where not
  shape?: SkyShape;
  moonDirection: Vector3;
  sunDirection: Vector3;
}
