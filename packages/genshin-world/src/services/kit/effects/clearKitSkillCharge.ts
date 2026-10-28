import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { KIT_SKILL_CHARGE_ID } from "#src/services/kit/constants";
import { endKitStatus } from "#src/services/kit/effects/endKitStatus";

// Clears the mark a kit completed a character's held skill's charge with, so the next hold starts uncharged
export const clearKitSkillCharge = (kitEffectState: KitEffectState, characterId: number): void => {
  endKitStatus(kitEffectState, characterId, KIT_SKILL_CHARGE_ID);
};
