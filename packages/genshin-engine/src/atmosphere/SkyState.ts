import type { SkyKeyframe } from "#src/atmosphere/SkyKeyframe";
import type { Vector3 } from "three";

// The sky at the clock's minute: its keyframes blended, and where the sun and moon stand. The light comes from
// Whichever of the two is above the horizon
export interface SkyState extends Omit<SkyKeyframe, "minutes"> {
  lightDirection: Vector3;
  moonDirection: Vector3;
  sunDirection: Vector3;
}
