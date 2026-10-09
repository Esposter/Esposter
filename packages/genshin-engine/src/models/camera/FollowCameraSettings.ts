// The settings the game offers for its follow camera: a horizontal and a vertical sensitivity, each from 1 to 5, and the
// Distance a zoom, combat or a teleport returns the camera to, from 4.5 to 6.0
export interface FollowCameraSettings {
  defaultDistance: number;
  horizontalSensitivity: number;
  verticalSensitivity: number;
}
