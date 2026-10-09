import type { LocomotionState } from "genshin-engine";

// What a kit reads of a step: the body's height above the ground, whether the attack is held and whether it, the burst
// Or the skill is pressed, whether the skill is held, and the body's movement state
export interface KitInput {
  height: number;
  isAttackHeld: boolean;
  isAttackPressed: boolean;
  isBurstPressed: boolean;
  isSkillHeld: boolean;
  isSkillPressed: boolean;
  locomotionState: LocomotionState;
}
