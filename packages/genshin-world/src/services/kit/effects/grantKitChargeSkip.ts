import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { KIT_CHARGE_SKIP_ID } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";

// Gives a character's next charged attack a skip of its charge, which stands for the seconds given until that attack spends it
export const grantKitChargeSkip = (
  kitEffectState: KitEffectState,
  characterId: number,
  secondsRemaining: number,
): void => {
  addKitStatus(kitEffectState, characterId, { id: KIT_CHARGE_SKIP_ID, secondsRemaining });
};
