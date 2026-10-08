// What the player asked for this frame: a move, each axis from -1 to 1, forward and right over the ground and up over
// It, and a look turn in radians since the last frame's read
export interface InputState {
  lookPitch: number;
  lookYaw: number;
  moveForward: number;
  moveRight: number;
  moveUp: number;
}
