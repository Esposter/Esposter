// The settings the game offers for its follow camera: a horizontal and a vertical sensitivity, each from 1 to 5, the
// Distance a zoom, combat or a teleport returns the camera to, from 4.5 to 6.0, and whether its pitch follows the slope
// As the character climbs or descends
export interface FollowCameraSettings {
  defaultDistance: number;
  horizontalSensitivity: number;
  slopePitch: boolean;
  verticalSensitivity: number;
}
