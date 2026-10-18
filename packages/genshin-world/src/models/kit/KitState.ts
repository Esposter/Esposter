import type { KitAction } from "#src/models/kit/KitAction";
import type { LocomotionState } from "genshin-engine";

// A character's kit in play, written in place each step: the action it is playing, the seconds it has run and the index
// Of its next hit to land, the misses toward its attacks' energy, how long the attack has been held, the strike the
// String plays next and the seconds since the last strike ended, whether a press has queued the next strike, the body's
// State at the last step, the height a plunge began at, and the presses of a skill chain with the seconds since the
// Last. While a plunge runs, its seconds count toward its next collision, as no action is playing. A swap starts the
// Next character's afresh
export interface KitState {
  action?: KitAction;
  // The seconds the action plays, which its `decideLength` may set as it runs in place of its own seconds
  actionLengthSeconds: number;
  actionSeconds: number;
  // The normal and charged attack hits on an enemy since the last that gave the character energy, each raising the
  // Chance the next one does
  attackEnergyMissCount: number;
  attackHeldSeconds: number;
  comboIndex: number;
  comboSeconds: number;
  isAttackQueued: boolean;
  locomotionState: LocomotionState;
  nextHitIndex: number;
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
