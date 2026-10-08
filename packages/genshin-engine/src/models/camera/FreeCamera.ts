import type { InputState } from "#src/models/input/InputState";

// A camera the player flies, turned by a frame's look once a frame and moved by its input once per fixed step
export interface FreeCamera {
  look: (input: InputState) => void;
  step: (input: InputState, stepSeconds: number) => void;
}
