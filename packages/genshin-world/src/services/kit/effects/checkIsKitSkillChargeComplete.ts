import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { KIT_SKILL_CHARGE_ID } from "#src/services/kit/constants";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// Whether a kit has completed the charge of a character's held skill, and the mark has not been cleared since
export const checkIsKitSkillChargeComplete = (kitEffectState: KitEffectState, characterId: number): boolean => {
  const status = findKitStatus(kitEffectState.effects, characterId, KIT_SKILL_CHARGE_ID);
  return status !== undefined && status.secondsRemaining > 0;
};
