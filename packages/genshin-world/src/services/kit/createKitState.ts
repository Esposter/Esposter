import type { KitState } from "#src/models/kit/KitState";

import { LocomotionState } from "genshin-engine";

// A kit at rest: no action playing, the string at its first strike, and the body on its feet
export const createKitState = (): KitState => ({
  actionSeconds: 0,
  attackHeldSeconds: 0,
  comboIndex: 0,
  comboSeconds: 0,
  isAttackQueued: false,
  locomotionState: LocomotionState.Idle,
  plungeStartHeight: 0,
});
