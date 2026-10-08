import type { KitAction } from "#src/models/kit/KitAction";
import type { LocomotionState } from "genshin-engine";

// A character's kit in play, written in place each step: the action it is playing and the seconds it has run, how long
// The attack has been held, the strike the string plays next and the seconds since the last strike ended, whether a
// Press has queued the next strike, the body's state at the last step, and the height a plunge began at. While a plunge
// Runs, its seconds count toward its next collision, as no action is playing
export interface KitState {
  action?: KitAction;
  actionSeconds: number;
  attackHeldSeconds: number;
  comboIndex: number;
  comboSeconds: number;
  isAttackQueued: boolean;
  locomotionState: LocomotionState;
  plungeStartHeight: number;
}
