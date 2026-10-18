import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { KIT_CHARGE_SKIP_ID } from "#src/services/kit/constants";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// Spends a character's charge skip if one stands, and reports whether one did, for the charged attack it starts to skip its charge
export const spendKitChargeSkip = (kitEffectState: KitEffectState, characterId: number): boolean => {
  const status = findKitStatus(kitEffectState.effects, characterId, KIT_CHARGE_SKIP_ID);
  if (status === undefined || status.secondsRemaining <= 0) return false;
  status.secondsRemaining = 0;
  return true;
};
