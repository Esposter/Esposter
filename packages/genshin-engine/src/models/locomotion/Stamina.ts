import type { LocomotionPhase } from "#src/models/locomotion/LocomotionPhase";

// The pool every action that takes effort spends: its value and the most it holds, which the statues raise, refilled to
// The most on a return from drowning, and
// Stepped with the body, spending what the state costs or refilling once the body has rested, and spent at once
// By a kit's action as it starts, through spend, which takes the amount under the consumption multiplier, and
// Checks through checkCanSpend that the pool holds it
export interface Stamina {
  checkCanSpend: (amount: number) => boolean;
  maximum: number;
  refill: () => void;
  spend: (amount: number) => void;
  step: (phase: LocomotionPhase, isEntered: boolean, isMoving: boolean, stepSeconds: number) => void;
  value: number;
}
