import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { KIT_SKILL_CHARGE_ID } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";

// Completes the charge of a character's held skill early, so its release plays the highest hold level whatever it was held
// For, as a hit on Candace's Heron's Sanctum does. The mark stands until the release reads it, or the next hold clears it
export const completeKitSkillCharge = (kitEffectState: KitEffectState, characterId: number): void =>
  addKitStatus(kitEffectState, characterId, { id: KIT_SKILL_CHARGE_ID, secondsRemaining: Infinity });
