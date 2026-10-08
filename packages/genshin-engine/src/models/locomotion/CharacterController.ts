import type { InputAction } from "#src/models/input/InputAction";
import type { InputState } from "#src/models/input/InputState";
import type { Locomotion } from "#src/models/locomotion/Locomotion";
import type { LocomotionPhase } from "#src/models/locomotion/LocomotionPhase";
import type { Stamina } from "#src/models/locomotion/Stamina";
import type { Vector3 } from "three";

// A body the player moves: its feet at its last two steps, which a frame blends between, the yaw it faces, zero along
// -z, its state and its stamina. A frame holds its presses for the next step to read, and each fixed step moves the
// Body by the frame's input relative to the camera's yaw, by the numbers of the body type it carries. A place stands it
// Still at a position and a facing, as a jump does, and face turns it on the spot
export interface CharacterController {
  face: (facing: number) => void;
  readonly facing: number;
  readonly heldPresses: ReadonlySet<InputAction>;
  holdPresses: (input: InputState) => void;
  readonly phase: Readonly<LocomotionPhase>;
  place: (position: Vector3, facing: number) => void;
  readonly position: Vector3;
  readonly previousPosition: Vector3;
  readonly stamina: Stamina;
  step: (input: InputState, cameraYaw: number, locomotion: Locomotion, stepSeconds: number) => void;
}
