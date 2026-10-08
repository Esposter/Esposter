import type { InputState } from "#src/models/input/InputState";

// The keys, pointer and gamepad a page listens to, read once a frame and disposed of with the page, and what the touch
// Controls drawn over it set: a key held by its on-screen button until released, an on-screen stick's axes from -1 to 1
// In the gamepad's sense, down and right positive, held until set back to rest, and a turn of the look in radians added
// To the next read's
export interface Input {
  dispose: () => void;
  press: (code: string) => void;
  readInput: (frameSeconds: number) => InputState;
  release: (code: string) => void;
  setTouchStick: (x: number, y: number) => void;
  turn: (lookYaw: number, lookPitch: number) => void;
}
