import type { LocomotionState } from "#src/models/locomotion/LocomotionState";

// What a pose is drawn from: the state the body is in, the phase of its stride in radians, which advances with the
// State's speed, and the seconds the whole body has been alive, which its breathing runs on
export interface CharacterPoseInput {
  elapsed: number;
  state: LocomotionState;
  stridePhase: number;
}
