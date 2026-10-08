import type { LocomotionState } from "#src/models/locomotion/LocomotionState";

// Where the body is in its states: the state, and the seconds it has been in it
export interface LocomotionPhase {
  state: LocomotionState;
  stateSeconds: number;
}
