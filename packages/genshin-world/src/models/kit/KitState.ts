import type { KitAction } from "#src/models/kit/KitAction";
import type { LocomotionState } from "genshin-engine";

// A character's kit in play, written in place each step: the action it is playing and the seconds it has run, the misses
// Toward its attacks' energy, how long the attack has been held, the strike the string plays next and the seconds since
// The last strike ended, whether a press has queued the next strike, the body's state at the last step, the height a
// Plunge began at, and the presses of a skill chain with the seconds since the last. While a plunge runs, its seconds
// Count toward its next collision, as no action is playing. A swap starts the next character's afresh
export interface KitState {
  action?: KitAction;
  actionSeconds: number;
  // The normal and charged attack hits on an enemy since the last that gave the character energy, each raising the
  // Chance the next one does
  attackEnergyMissCount: number;
  attackHeldSeconds: number;
  comboIndex: number;
  comboSeconds: number;
  isAttackQueued: boolean;
  locomotionState: LocomotionState;
  plungeStartHeight: number;
  // The presses of a skill chain played so far, zero once none is open, and the seconds since the last of them
  skillChainCount: number;
  skillChainSeconds: number;
  // The seconds the skill has been held, zero once let go and capped at its maximum, and the seconds it was held when it was
  // Let go this step, or when it reached its maximum
  skillHeldSeconds: number;
  skillReleasedSeconds: number;
  // The seconds the body has sprinted without pause, which a passive spends as it goes on
  sprintSeconds: number;
}
