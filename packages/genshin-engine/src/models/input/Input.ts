import type { InputState } from "#src/models/input/InputState";

// The keys, pointer and gamepad a page listens to, read once a frame
export interface Input {
  readInput: () => InputState;
}
