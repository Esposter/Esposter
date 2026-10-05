// A camera as a screen point is read through: its width over its height, its vertical field in degrees, and its
// Pitch and heading in radians
export interface ScreenCamera {
  aspect: number;
  fov: number;
  pitch: number;
  yaw: number;
}
