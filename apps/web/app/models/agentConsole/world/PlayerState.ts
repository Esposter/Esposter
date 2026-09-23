import type { Vector3 } from "three";
// Where the player is, shared by the figure that moves it and the camera that follows it. It changes every frame, so it
// Is a plain object and never reactive: a frame writes it without re-rendering anything
export interface PlayerState {
  // The yaw the camera looks along, which the input's forward is taken from
  cameraAzimuth: number;
  // The way the figure faces, as a turn about the vertical from facing +z
  heading: number;
  isOnGround: boolean;
  isSneaking: boolean;
  isSprinting: boolean;
  // Where the feet are after the last simulation step, and after the one before, which a frame draws between
  position: Vector3;
  previousPosition: Vector3;
  // Where the feet are drawn this frame
  renderPosition: Vector3;
  // In blocks a tick, as Minecraft keeps it
  velocity: Vector3;
  // How far the feet have walked, which the limbs' swing is timed by rather than by the clock, so the feet never slide
  walkedDistance: number;
}
