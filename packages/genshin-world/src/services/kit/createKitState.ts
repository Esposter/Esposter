import type { KitState } from "#src/models/kit/KitState";

import { LocomotionState } from "genshin-engine";

// A kit at rest: no action playing, no miss toward its attacks' energy, the string at its first strike, and the body on
// Its feet
export const createKitState = (): KitState => ({
  actionLengthSeconds: 0,
  actionSeconds: 0,
  attackEnergyMissCount: 0,
  attackHeldSeconds: 0,
  comboIndex: 0,
  comboSeconds: 0,
  isAttackQueued: false,
  locomotionState: LocomotionState.Idle,
  nextHitIndex: 0,
  plungeStartHeight: 0,
  skillChainCount: 0,
  skillChainSeconds: 0,
  skillHeldSeconds: 0,
  skillReleasedSeconds: 0,
  sprintSeconds: 0,
});
