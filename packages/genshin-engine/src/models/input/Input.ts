import type { InputState } from "#src/models/input/InputState";

// The keys, pointer and gamepad a page listens to, read once a frame and disposed of with the page
export interface Input {
  dispose: () => void;
  readInput: (frameSeconds: number) => InputState;
}
