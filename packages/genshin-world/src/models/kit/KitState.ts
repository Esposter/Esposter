import type { KitAction } from "#src/models/kit/KitAction";
import type { LocomotionState } from "genshin-engine";

// A character's kit in play, written in place each step: the action it is playing and the seconds it has run, how long
// The attack has been held, the strike the string plays next and the seconds since the last strike ended, whether a
// Press has queued the next strike, the body's state at the last step, the height a plunge began at, and the presses of
// A skill chain with the seconds since the last. While a plunge runs, its seconds count toward its next collision, as no
// Action is playing
export interface KitState {
  action?: KitAction;
  actionSeconds: number;
  attackHeldSeconds: number;
  comboIndex: number;
  comboSeconds: number;
  isAttackQueued: boolean;
  locomotionState: LocomotionState;
  plungeStartHeight: number;
  // The presses of a skill chain played so far, zero once none is open, and the seconds since the last of them
  skillChainCount: number;
  skillChainSeconds: number;
}
