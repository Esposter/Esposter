import type { LocomotionPhase } from "#src/models/locomotion/LocomotionPhase";

// The pool every action that takes effort spends: its value, refilled to the most on a return from drowning, and
// Stepped with the body, spending what the state costs or refilling once the body has rested
export interface Stamina {
  refill: () => void;
  step: (phase: LocomotionPhase, isEntered: boolean, isMoving: boolean, stepSeconds: number) => void;
  value: number;
}
